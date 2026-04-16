import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailOtpType } from '@supabase/supabase-js';
import { LoaderCircle, MailCheck, RefreshCcwKey } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type CallbackState = 'loading' | 'success' | 'error';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [state, setState] = useState<CallbackState>('loading');
  const [message, setMessage] = useState('Validando seu link de acesso...');

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryType = searchParams.get('type');
      const tokenHash = searchParams.get('token_hash');
      const code = searchParams.get('code');
      const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

      if (errorDescription) {
        throw new Error(decodeURIComponent(errorDescription));
      }

      if (tokenHash && queryType) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: queryType as EmailOtpType,
        });

        if (error) throw error;

        if (queryType === 'recovery') {
          setState('success');
          setMessage('Link validado. Redirecionando para redefinir sua senha...');
          navigate('/reset-password', { replace: true });
          return;
        }

        setState('success');
        setMessage('Email confirmado com sucesso. Redirecionando para o SICOFI...');
        toast({ title: 'Email confirmado!', description: 'Sua conta foi ativada com sucesso.' });
        navigate('/', { replace: true });
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        setState('success');
        setMessage('Acesso confirmado. Redirecionando para o SICOFI...');
        navigate('/', { replace: true });
        return;
      }

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        if (hashType === 'recovery') {
          setState('success');
          setMessage('Link validado. Redirecionando para redefinir sua senha...');
          navigate('/reset-password', { replace: true });
          return;
        }

        setState('success');
        setMessage('Acesso confirmado. Redirecionando para o SICOFI...');
        navigate('/', { replace: true });
        return;
      }

      throw new Error('O link é inválido ou expirou. Solicite um novo email e tente novamente.');
    };

    handleCallback().catch((error: unknown) => {
      const description = error instanceof Error ? error.message : 'Não foi possível validar o link.';
      setState('error');
      setMessage(description);
      toast({ title: 'Link inválido', description, variant: 'destructive' });
      window.setTimeout(() => navigate('/auth', { replace: true }), 2500);
    });
  }, [navigate, searchParams, toast]);

  const icon =
    state === 'loading' ? (
      <LoaderCircle className="h-12 w-12 text-primary animate-spin" />
    ) : state === 'success' ? (
      <MailCheck className="h-12 w-12 text-primary" />
    ) : (
      <RefreshCcwKey className="h-12 w-12 text-primary" />
    );

  const title =
    state === 'loading'
      ? 'Processando acesso seguro'
      : state === 'success'
        ? 'Tudo certo no SICOFI'
        : 'Não foi possível concluir';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="glass w-full max-w-md">
        <CardHeader className="text-center items-center gap-4">
          {icon}
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Você está sendo atendido dentro do ambiente seguro do SICOFI.
        </CardContent>
      </Card>
    </div>
  );
}