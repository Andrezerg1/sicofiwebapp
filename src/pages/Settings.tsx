import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState({
    monthly_income: 0,
    monthly_expenses: 0,
    savings_goal: 0,
    debt_total: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, onboardRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', user.id).single(),
        supabase.from('financial_onboarding').select('*').eq('user_id', user.id).single(),
      ]);
      setFullName(profileRes.data?.full_name || '');
      if (onboardRes.data) {
        setOnboarding({
          monthly_income: onboardRes.data.monthly_income || 0,
          monthly_expenses: onboardRes.data.monthly_expenses || 0,
          savings_goal: onboardRes.data.savings_goal || 0,
          debt_total: onboardRes.data.debt_total || 0,
        });
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    await supabase.from('profiles').update({ full_name: fullName }).eq('user_id', user.id);

    const { data: existing } = await supabase.from('financial_onboarding').select('id').eq('user_id', user.id).single();
    if (existing) {
      await supabase.from('financial_onboarding').update({ ...onboarding, completed: true }).eq('user_id', user.id);
    } else {
      await supabase.from('financial_onboarding').insert({ user_id: user.id, ...onboarding, completed: true });
    }

    toast({ title: 'Configurações salvas!' });
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil e dados financeiros</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Dados Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Renda mensal (R$)</Label>
              <Input type="number" value={onboarding.monthly_income} onChange={e => setOnboarding(o => ({ ...o, monthly_income: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Despesas mensais (R$)</Label>
              <Input type="number" value={onboarding.monthly_expenses} onChange={e => setOnboarding(o => ({ ...o, monthly_expenses: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Meta de economia (R$)</Label>
              <Input type="number" value={onboarding.savings_goal} onChange={e => setOnboarding(o => ({ ...o, savings_goal: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Dívidas totais (R$)</Label>
              <Input type="number" value={onboarding.debt_total} onChange={e => setOnboarding(o => ({ ...o, debt_total: +e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="gradient-primary">
        <Save className="h-4 w-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  );
}
