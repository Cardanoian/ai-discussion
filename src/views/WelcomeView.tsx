import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { BrainCircuit, LogIn } from 'lucide-react';

const WelcomeView = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/main`,
      },
    });
    if (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <Card className='w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-500'>
        <CardHeader className='items-center'>
          <BrainCircuit className='w-16 h-16 mb-4 text-primary' />
          <CardTitle>
            <h1 className='text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400'>
              AI 토론 배틀
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center'>
          <p className='mb-8 text-center text-muted-foreground'>
            당신의 논리를 AI와 함께 갈고닦아 보세요.
          </p>
          <Button onClick={handleLogin} size='lg' className='w-full'>
            <LogIn className='w-5 h-5 mr-2' />
            Google로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeView;
