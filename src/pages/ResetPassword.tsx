import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, DollarSign, CheckCircle, LoaderCircle } from 'lucide-react';

type RecoveryStatus = 'checking' | 'ready' | 'invalid';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>('checking');
  const [statusMessage, setStatusMessage] = useState('Validando seu link de recuperação...');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isRecovery, loading: authLoading } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const validateRecoveryLink = async () => {
      try {
        const markReady = (message = 'Link validado. Defina sua nova senha abaixo.') => {
          if (!isMounted) return;
          setRecoveryStatus('ready');
          setStatusMessage(message);
        };

        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        if (user || isRecovery) {
          markReady('Agora é só definir sua nova senha.');
          return;
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session?.user && isMounted) {
            setRecoveryStatus('ready');
            setStatusMessage('Link validado. Defina sua nova senha abaixo.');
          }
        });

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          authListener.subscription.unsubscribe();
          markReady('Agora é só definir sua nova senha.');
          return;
        }

        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const code = searchParams.get('code');

        if (tokenHash && type === 'recovery') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error) throw error;

          window.history.replaceState({}, document.title, window.location.pathname);
          authListener.subscription.unsubscribe();
          markReady();
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          window.history.replaceState({}, document.title, window.location.pathname);
          authListener.subscription.unsubscribe();
          markReady();
          return;
        }

        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');

        if (accessToken && refreshToken && hashType === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          window.history.replaceState({}, document.title, window.location.pathname);
          authListener.subscription.unsubscribe();
          markReady();
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 1200));

        const { data: delayedSession } = await supabase.auth.getSession();
        authListener.subscription.unsubscribe();

        if (delayedSession.session?.user || isRecovery) {
          markReady('Agora é só definir sua nova senha.');
          return;
        }

        throw new Error('O link de recuperação é inválido ou expirou. Solicite um novo email.');
      } catch (error: any) {
        if (!isMounted) return;
        const message = error.message || 'Não foi possível validar o link de recuperação.';
        setRecoveryStatus('invalid');
        setStatusMessage(message);
      }
    };

    validateRecoveryLink();

    return () => {
      isMounted = false;
    };
  }, [isRecovery, user]);

  useEffect(() => {
    if (!authLoading && (user || isRecovery)) {
      setRecoveryStatus('ready');
      setStatusMessage('Agora é só definir sua nova senha.');
    }
  }, [authLoading, isRecovery, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Senha atualizada!', description: 'Sua senha foi redefinida com sucesso.' });
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Senha redefinida!</h2>
            <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recoveryStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <LoaderCircle className="h-12 w-12 mx-auto text-primary animate-spin" />
            <h2 className="text-xl font-bold">Validando acesso</h2>
            <p className="text-muted-foreground">{statusMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recoveryStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <DollarSign className="h-12 w-12 mx-auto text-primary" />
            <h2 className="text-xl font-bold">Link inválido ou expirado</h2>
            <p className="text-muted-foreground">{statusMessage}</p>
            <Button onClick={() => navigate('/auth')} className="gradient-primary">Voltar ao login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-primary">
            <DollarSign className="h-6 w-6 text-primary-foreground" />
            <span className="text-xl font-bold text-primary-foreground font-['Space_Grotesk']">SICOFI</span>
          </div>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>{statusMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar nova senha</Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? 'Aguarde...' : 'Redefinir senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
