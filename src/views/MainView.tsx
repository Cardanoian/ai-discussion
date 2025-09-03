import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User as UserIcon,
  Sparkles,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import { useMainViewModel } from '@/viewmodels/MainViewModel';

const MainView = () => {
  const { user, avatarUrl, handleLogout } = useMainViewModel();

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative flex flex-col h-screen p-4 md:p-8'>
        <header className='flex justify-between items-center mb-12'>
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-20 animate-pulse'></div>
              <BrainCircuit className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' />
            </div>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500'>
              AI 토론 배틀
            </h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 px-4 py-2'
                >
                  <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden'>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt='프로필 사진'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <UserIcon className='w-4 h-4 text-white' />
                    )}
                  </div>
                  <span className='font-medium'>{user.display_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 p-2'
              >
                <DropdownMenuLabel className='px-2 py-1.5'>
                  내 계정
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to='/profile'>
                  <DropdownMenuItem className='px-2 py-2'>
                    <UserIcon className='w-4 h-4 mr-2' />
                    프로필
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='text-red-600 dark:text-red-400 px-2 py-2'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className='flex-grow grid md:grid-cols-2 gap-8 animate-in fade-in-50 duration-700'>
          <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02] flex flex-col'>
            {/* Card gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <CardHeader className='relative'>
              <CardTitle className='flex items-center text-xl'>
                <div className='relative mr-3'>
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                </div>
                자료 만들기
                <Sparkles className='w-4 h-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300' />
              </CardTitle>
              <CardDescription className='text-muted-foreground/80 leading-relaxed'>
                토론 주제에 대한 당신의 논리를 미리 준비하고 정리해 보세요.
                <br />
                <span className='text-sm opacity-75'>AI가 도움을 드립니다</span>
              </CardDescription>
            </CardHeader>
            <CardContent className='relative flex-grow flex items-end'>
              <Link to='/docs' className='w-full'>
                <Button
                  size='lg'
                  className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group'
                >
                  준비하러 가기
                  <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:scale-[1.02] flex flex-col'>
            {/* Card gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <CardHeader className='relative'>
              <CardTitle className='flex items-center text-xl'>
                <div className='relative mr-3'>
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                </div>
                대전하기
                <Sparkles className='w-4 h-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300' />
              </CardTitle>
              <CardDescription className='text-muted-foreground/80 leading-relaxed'>
                준비된 자료를 바탕으로 다른 사용자와 실시간 토론 배틀을
                시작하세요.
                <br />
                <span className='text-sm opacity-75'>실력을 겨뤄보세요</span>
              </CardDescription>
            </CardHeader>
            <CardContent className='relative flex-grow flex items-end'>
              <Link to='/waiting-room' className='w-full'>
                <Button
                  size='lg'
                  className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group'
                >
                  대전하러 가기
                  <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>

        {/* Bottom stats or info */}
        <div className='mt-8 flex justify-center'>
          <div className='flex items-center space-x-6 text-sm text-muted-foreground bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></div>
              실시간 매칭
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse delay-300'></div>
              AI 피드백
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse delay-700'></div>
              스킬 향상
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainView;
