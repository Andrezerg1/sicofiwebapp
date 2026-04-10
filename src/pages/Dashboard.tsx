import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatMonth } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  type: string;
  amount: number;
  date: string;
  description: string;
  categories?: { name: string; color: string; icon: string } | null;
}

const CHART_COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#eab308', '#8b5cf6', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const sixMonthsAgo = subMonths(new Date(), 6);
      const { data } = await supabase
        .from('transactions')
        .select('type, amount, date, description, categories(name, color, icon)')
        .eq('user_id', user.id)
        .gte('date', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: true });
      setTransactions((data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const currentMonth = new Date();
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const currentTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Monthly chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(currentMonth, 5 - i);
    const mStart = format(startOfMonth(month), 'yyyy-MM-dd');
    const mEnd = format(endOfMonth(month), 'yyyy-MM-dd');
    const mTrans = transactions.filter(t => t.date >= mStart && t.date <= mEnd);
    return {
      name: format(month, 'MMM', { locale: ptBR }),
      receitas: mTrans.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      despesas: mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    };
  });

  // Category breakdown for expenses
  const categoryMap = new Map<string, { value: number; color: string }>();
  currentTransactions.filter(t => t.type === 'expense').forEach(t => {
    const name = t.categories?.name || 'Outros';
    const color = t.categories?.color || '#6b7280';
    const existing = categoryMap.get(name);
    categoryMap.set(name, { value: (existing?.value || 0) + Number(t.amount), color });
  });
  const pieData = Array.from(categoryMap.entries()).map(([name, { value, color }]) => ({ name, value, color }));

  const statCards = [
    { title: 'Receitas', value: totalIncome, icon: ArrowUpRight, gradient: 'gradient-income', change: '+12%' },
    { title: 'Despesas', value: totalExpense, icon: ArrowDownLeft, gradient: 'gradient-expense', change: '-3%' },
    { title: 'Saldo', value: balance, icon: Wallet, gradient: 'gradient-primary', change: balance >= 0 ? 'Positivo' : 'Negativo' },
    { title: 'Economia', value: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0, icon: TrendingUp, gradient: 'gradient-primary', isPercent: true },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground capitalize">{formatMonth(currentMonth)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="glass overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.title}</span>
                <div className={`h-9 w-9 rounded-lg ${card.gradient} flex items-center justify-center`}>
                  <card.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {card.isPercent ? `${card.value.toFixed(1)}%` : formatCurrency(card.value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{card.isPercent ? 'Taxa de economia' : card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="receitas" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                Nenhuma despesa este mês
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {currentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhuma transação este mês. Comece adicionando uma!</p>
          ) : (
            <div className="space-y-2">
              {currentTransactions.slice(-5).reverse().map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.categories?.icon || (t.type === 'income' ? '💰' : '💸')}</span>
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.categories?.name || 'Sem categoria'}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
