import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  category_id: string | null;
  spreadsheet_id: string | null;
  ai_generated: boolean | null;
  categories: { name: string; icon: string | null; color: string | null } | null;
}

interface Spreadsheet {
  id: string;
  name: string;
}

export default function Transactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [form, setForm] = useState({
    type: 'expense' as string,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    spreadsheet_id: '',
    notes: '',
  });

  const fetchAll = async () => {
    if (!user) return;
    const [txRes, catRes, sheetRes] = await Promise.all([
      supabase.from('transactions').select('*, categories(name, icon, color)').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id),
      supabase.from('spreadsheets').select('id, name').eq('user_id', user.id),
    ]);
    setTransactions((txRes.data as any) || []);
    setCategories(catRes.data || []);
    setSpreadsheets(sheetRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const resetForm = () => {
    setForm({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0], category_id: '', spreadsheet_id: '', notes: '' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user || !form.description || !form.amount) return;
    const payload = {
      user_id: user.id,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
      category_id: form.category_id || null,
      spreadsheet_id: form.spreadsheet_id || null,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingId);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Transação atualizada!' });
    } else {
      const { error } = await supabase.from('transactions').insert(payload);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Transação adicionada!' });
    }

    setDialogOpen(false);
    resetForm();
    fetchAll();
  };

  const handleEdit = (t: Transaction) => {
    setForm({
      type: t.type,
      amount: String(t.amount),
      description: t.description,
      date: t.date,
      category_id: t.category_id || '',
      spreadsheet_id: t.spreadsheet_id || '',
      notes: t.notes || '',
    });
    setEditingId(t.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    toast({ title: 'Transação excluída' });
    fetchAll();
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredCategories = categories.filter(c => c.type === form.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" /> Nova Transação</Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Nova'} Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={form.type === 'expense' ? 'default' : 'outline'} onClick={() => setForm(f => ({ ...f, type: 'expense', category_id: '' }))} className={form.type === 'expense' ? 'gradient-expense' : ''}>
                  Despesa
                </Button>
                <Button variant={form.type === 'income' ? 'default' : 'outline'} onClick={() => setForm(f => ({ ...f, type: 'income', category_id: '' }))} className={form.type === 'income' ? 'gradient-income' : ''}>
                  Receita
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Almoço no restaurante" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Planilha</Label>
                <Select value={form.spreadsheet_id} onValueChange={v => setForm(f => ({ ...f, spreadsheet_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {spreadsheets.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações" />
              </div>
              <Button className="w-full gradient-primary" onClick={handleSave}>
                {editingId ? 'Salvar alterações' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar transações..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="glass">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Nenhuma transação encontrada</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.categories?.icon || (t.type === 'income' ? '💰' : '💸')}</span>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.date)} · {t.categories?.name || 'Sem categoria'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
