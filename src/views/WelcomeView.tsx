import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { BrainCircuit, Sparkles } from 'lucide-react';

const WelcomeView = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <Card className='relative w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10'>
        <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg'></div>

        <CardHeader className='relative items-center pt-8 pb-4'>
          <div className='relative flex flex-col items-center justify-center mb-6'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse'></div>
            <img
              src='/favicon.png'
              alt='AI 토론 배틀 로고'
              className='relative w-80 h-auto max-w-[70%]'
            />
            <BrainCircuit className='relative w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' />
          </div>

          <CardTitle className='relative'>
            <h1 className='text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 animate-gradient-x'>
              AI 토론 배틀
            </h1>
            <div className='flex items-center justify-center mt-2'>
              <Sparkles className='w-4 h-4 text-yellow-500 mr-1 animate-pulse' />
              <span className='text-sm text-muted-foreground font-medium'>
                Powered by 경상북도교육청 G-AI Lab
              </span>
              <Sparkles className='w-4 h-4 text-yellow-500 ml-1 animate-pulse delay-500' />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className='relative flex flex-col items-center pb-8'>
          <p className='mb-8 text-center text-muted-foreground leading-relaxed'>
            당신의 논리를 AI와 함께 갈고닦아 보세요.
            <br />
            <span className='text-sm opacity-75'>
              실시간 토론으로 실력을 향상시키세요
            </span>
          </p>

          <Button
            onClick={handleLogin}
            size='lg'
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02]'
          >
            <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Google로 시작하기
          </Button>

          <div className='mt-6 flex items-center space-x-4 text-xs text-muted-foreground'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse'></div>
              무료 서비스
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse delay-300'></div>
              실시간 매칭
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse delay-700'></div>
              AI 피드백
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeView;
