import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, FileSpreadsheet, Plus, Search, Trash2, Sparkles, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import { DemoTransaction, demoSheets, getDemoTransactions, saveDemoTransactions } from '@/lib/demo-data';

function useDemoRecords() {
  const [records, setRecords] = useState(getDemoTransactions);
  const update = (next: DemoTransaction[]) => {
    setRecords(next);
    saveDemoTransactions(next);
  };
  return [records, update] as const;
}

function transactionFrom(description: string, amount: number, type: 'income' | 'expense'): DemoTransaction {
  return {
    id: crypto.randomUUID(),
    type,
    amount,
    description,
    date: new Date().toISOString().slice(0, 10),
    spreadsheet_id: 'general',
    categories: type === 'income'
      ? { name: 'Outras receitas', icon: '💰', color: '#22c55e' }
      : { name: 'Outras despesas', icon: '💸', color: '#f97316' },
  };
}

function RecordList({ records, onDelete }: { records: DemoTransaction[]; onDelete?: (id: string) => void }) {
  return (
    <Card className="glass">
      <CardContent className="p-0 divide-y divide-border">
        {records.length === 0 && <p className="p-8 text-center text-muted-foreground">Nenhuma transação encontrada</p>}
        {records.map(record => (
          <div key={record.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{record.categories.icon}</span>
              <div className="min-w-0">
                <p className="font-medium truncate">{record.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(record.date)} · {record.categories.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={record.type === 'income' ? 'text-[hsl(var(--income))] font-semibold' : 'text-[hsl(var(--expense))] font-semibold'}>
                {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
              </span>
              {onDelete && <Button variant="ghost" size="icon" aria-label="Excluir transação" onClick={() => onDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DemoTransactions() {
  const [records, update] = useDemoRecords();
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const filtered = [...records].filter(record => record.description.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));

  const add = () => {
    const value = Number(amount);
    if (!description.trim() || !Number.isFinite(value) || value <= 0) return;
    update([transactionFrom(description.trim(), value, type), ...records]);
    setDescription('');
    setAmount('');
    setAdding(false);
    toast({ title: 'Transação adicionada à demonstração' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div><h1 className="text-3xl font-bold">Transações</h1><p className="text-muted-foreground">Gerencie suas receitas e despesas</p></div>
        <Button className="gradient-primary" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4 mr-2" /> Nova Transação</Button>
      </div>
      {adding && <Card className="glass"><CardHeader><CardTitle>Nova Transação</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4">
        <Input aria-label="Descrição" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
        <Input aria-label="Valor" placeholder="Valor (R$)" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
        <select aria-label="Tipo" value={type} onChange={e => setType(e.target.value as 'income' | 'expense')} className="rounded-md border border-input bg-background px-3 text-sm"><option value="expense">Despesa</option><option value="income">Receita</option></select>
        <Button onClick={add}>Salvar</Button>
      </CardContent></Card>}
      <div className="relative max-w-sm"><Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" /><Input aria-label="Buscar transações" placeholder="Buscar transações..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <RecordList records={filtered} onDelete={id => { update(records.filter(record => record.id !== id)); toast({ title: 'Transação removida da demonstração' }); }} />
    </div>
  );
}

export function DemoSpreadsheets() {
  const [records] = useDemoRecords();
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  if (selected) {
    const sheet = demoSheets.find(item => item.id === selected);
    return <div className="space-y-6"><Button variant="ghost" onClick={() => setSelected(null)}>← Voltar</Button><h1 className="text-3xl font-bold">{sheet?.name}</h1><RecordList records={records.filter(record => record.spreadsheet_id === selected).sort((a, b) => b.date.localeCompare(a.date))} /></div>;
  }
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Planilhas</h1><p className="text-muted-foreground">Organize suas finanças em múltiplas planilhas</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{demoSheets.map(sheet => {
      const entries = records.filter(record => record.spreadsheet_id === sheet.id);
      const income = entries.filter(record => record.type === 'income').reduce((sum, record) => sum + record.amount, 0);
      const expense = entries.filter(record => record.type === 'expense').reduce((sum, record) => sum + record.amount, 0);
      return <Card key={sheet.id} className="glass cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelected(sheet.id)}><CardHeader><CardTitle className="flex gap-2 items-center"><FileSpreadsheet className="h-5 w-5" style={{ color: sheet.color }} />{sheet.name}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">{entries.length} transações</p><div className="flex justify-between text-sm"><span className="text-[hsl(var(--income))]">+{formatCurrency(income)}</span><span className="text-[hsl(var(--expense))]">-{formatCurrency(expense)}</span></div></CardContent></Card>;
    })}</div>
    <Button variant="outline" onClick={() => navigate('/transactions')}>Ver transações</Button>
  </div>;
}

export function DemoAI() {
  const [input, setInput] = useState('');
  const [records, update] = useDemoRecords();
  const { toast } = useToast();
  const value = Number(input.match(/\d+(?:[.,]\d{1,2})?/)?.[0].replace(',', '.') || 0);
  const type = /recebi|ganhei|vendi|salário/i.test(input) ? 'income' : 'expense';
  const add = () => {
    if (!input.trim() || value <= 0) return;
    update([transactionFrom(input.trim(), value, type), ...records]);
    setInput('');
    toast({ title: 'Transação salva na demonstração' });
  };
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">IA Financeira</h1><p className="text-muted-foreground">Descreva sua transação em linguagem natural</p></div>
    <Card className="glass"><CardContent className="p-6 space-y-4"><div className="flex items-center gap-2"><Bot className="text-primary" /><span className="font-medium">Experimente uma frase</span></div><div className="flex gap-2"><Input aria-label="Descreva uma transação" placeholder="Ex: Gastei 50 reais no supermercado" value={input} onChange={e => setInput(e.target.value)} /><Button className="gradient-primary" onClick={add} disabled={!input.trim() || value <= 0}><Sparkles className="h-4 w-4 mr-2" /> Salvar</Button></div><div className="flex gap-2 flex-wrap">{['Gastei 45 reais no almoço', 'Recebi 3500 de salário'].map(example => <button key={example} className="text-xs rounded-full bg-muted px-3 py-2" onClick={() => setInput(example)}>{example}</button>)}</div></CardContent></Card>
  </div>;
}

export function DemoSettings() {
  const [name, setName] = useState('Usuário de demonstração');
  const [income, setIncome] = useState('4500');
  const [goal, setGoal] = useState('1000');
  const { toast } = useToast();
  return <div className="space-y-6 max-w-2xl">
    <div><h1 className="text-3xl font-bold">Configurações</h1><p className="text-muted-foreground">Gerencie seu perfil e dados financeiros</p></div>
    <Card className="glass"><CardHeader><CardTitle>Perfil</CardTitle></CardHeader><CardContent className="space-y-3"><label className="text-sm">Nome completo</label><Input value={name} onChange={e => setName(e.target.value)} /><label className="text-sm">Renda mensal (R$)</label><Input type="number" value={income} onChange={e => setIncome(e.target.value)} /><label className="text-sm">Meta de economia (R$)</label><Input type="number" value={goal} onChange={e => setGoal(e.target.value)} /></CardContent></Card>
    <Button className="gradient-primary" onClick={() => toast({ title: 'Configurações atualizadas nesta demonstração' })}><Save className="h-4 w-4 mr-2" /> Salvar configurações</Button>
  </div>;
}
