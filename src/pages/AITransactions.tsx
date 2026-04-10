import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Check, X, Sparkles, Loader2 } from 'lucide-react';

interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function AITransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [defaultSheet, setDefaultSheet] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [catRes, sheetRes] = await Promise.all([
        supabase.from('categories').select('id, name, type').eq('user_id', user.id),
        supabase.from('spreadsheets').select('id').eq('user_id', user.id).eq('is_default', true).single(),
      ]);
      setCategories(catRes.data || []);
      setDefaultSheet(sheetRes.data?.id || null);
    };
    fetch();
  }, [user]);

  const handleParse = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setParsed(null);

    try {
      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { message: input },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setParsed(data.transaction);
    } catch (error: any) {
      toast({
        title: 'Erro ao interpretar',
        description: error.message || 'Tente descrever de outra forma.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!user || !parsed) return;

    const matchedCategory = categories.find(
      c => c.name.toLowerCase() === parsed.category.toLowerCase() && c.type === parsed.type
    );

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      date: parsed.date,
      category_id: matchedCategory?.id || null,
      spreadsheet_id: defaultSheet,
      ai_generated: true,
    });

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Transação salva!', description: `${parsed.description} - ${formatCurrency(parsed.amount)}` });
    setParsed(null);
    setInput('');
  };

  const examples = [
    'Gastei 45 reais no almoço hoje',
    'Recebi 3500 de salário dia 5',
    'Paguei 120 de conta de luz',
    'Uber para o trabalho custou 18 reais',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IA Financeira</h1>
        <p className="text-muted-foreground">Descreva sua transação em linguagem natural</p>
      </div>

      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleParse()}
                  placeholder="Ex: Gastei 50 reais no supermercado ontem"
                  className="flex-1"
                  disabled={loading}
                />
                <Button onClick={handleParse} disabled={loading || !input.trim()} className="gradient-primary">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {parsed && (
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Confirmação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className={`font-medium ${parsed.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'}`}>
                  {parsed.type === 'income' ? '📈 Receita' : '📉 Despesa'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valor</p>
                <p className="font-bold text-lg">{formatCurrency(parsed.amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="font-medium">{parsed.description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Categoria</p>
                <p className="font-medium">{parsed.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-medium">{new Date(parsed.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleConfirm} className="flex-1 gradient-income">
                <Check className="h-4 w-4 mr-2" /> Confirmar e Salvar
              </Button>
              <Button variant="outline" onClick={() => setParsed(null)} className="flex-1">
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
