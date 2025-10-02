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
  User as UserIcon,
  Trophy,
  Target,
  TrendingUp,
  ArrowLeft,
  Zap,
  Edit,
} from 'lucide-react';
import { useProfileViewModel } from '@/viewmodels/ProfileViewModel';
import ProfileButton from '@/components/ProfileButton';
import ProfileChangeModal from '@/components/modals/ProfileChangeModal';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import ThemeToggleButton from '@/components/ThemeToggleButton';

const ProfileView = () => {
  const {
    // State
    userProfile,
    userStats,
    loading,
    isEditProfileOpen,
    rank,

    // Getters
    getPointsToPromotion,
    getPointsToDemotion,
    getDisplayName,

    // Setters
    setIsEditProfileOpen,
  } = useProfileViewModel();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative flex flex-col h-screen p-4 md:p-8'>
        <header className='flex justify-between items-center mb-12'>
          <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500'>
            내 프로필
          </h1>
          <div className='flex items-center gap-2'>
            <ThemeToggleButton />
            {userProfile && <ProfileButton userProfile={userProfile} />}
          </div>
        </header>

        <main className='flex-grow animate-in fade-in-50 duration-700 flex flex-col'>
          {/* User Info Card */}
          <div className='mb-8'>
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

              <CardHeader className='relative pb-4'>
                <div className='flex items-center space-x-6'>
                  <div className='relative group'>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${rank.color} rounded-full blur-lg opacity-30 animate-pulse`}
                    ></div>
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt='Avatar'
                        className='relative w-24 h-24 rounded-full shadow-lg object-cover border-2 border-white/20'
                      />
                    ) : (
                      <div
                        className={`relative w-24 h-24 bg-gradient-to-r ${rank.color} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <UserIcon className='w-12 h-12 text-white' />
                      </div>
                    )}
                  </div>

                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2 justify-center'>
                      <CardTitle className='text-2xl'>
                        {getDisplayName()}
                      </CardTitle>
                    </div>
                    <div className='flex items-center space-x-2 justify-center'>
                      <span
                        className={`text-lg font-semibold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}
                      >
                        {rank.title}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {/* ELO Rating */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-yellow-500/10 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <Trophy className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500' />
                  </div>
                </div>
                <CardTitle className={`text-3xl font-bold ${rank.textColor}`}>
                  {Math.floor(userStats.rating)}
                </CardTitle>
                <CardDescription>레이팅</CardDescription>
              </CardHeader>
            </Card>

            {/* Total Games */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <TrendingUp className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
                  {userStats.total_games}
                </CardTitle>
                <CardDescription>전체 게임</CardDescription>
              </CardHeader>
            </Card>

            {/* Points to Promotion */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <TrendingUp className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-emerald-600 dark:text-emerald-400'>
                  {getPointsToPromotion(userStats.rating)}
                </CardTitle>
                <CardDescription>승급까지</CardDescription>
              </CardHeader>
            </Card>

            {/* Points to Demotion */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <Target className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-orange-600 dark:text-orange-400'>
                  {getPointsToDemotion(userStats.rating)}
                </CardTitle>
                <CardDescription>강등까지</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Game Results */}
          <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <CardHeader className='relative'>
              <CardTitle className='flex items-center text-xl'>
                <div className='relative mr-3'>
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                  <Zap className='relative w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500' />
                </div>
                게임 결과
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600 dark:text-green-400 mb-1'>
                    {userStats.wins}
                  </div>
                  <div className='text-sm text-muted-foreground'>승리</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-red-600 dark:text-red-400 mb-1'>
                    {userStats.loses}
                  </div>
                  <div className='text-sm text-muted-foreground'>패배</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
                    {userStats.win_rate.toFixed(1)}%
                  </div>
                  <div className='text-sm text-muted-foreground'>승률</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Buttons */}
          <div className='flex justify-center items-center gap-4 mt-6'>
            <Link to='/main'>
              <Button className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 group px-8 py-3'>
                <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300' />
                메인으로
              </Button>
            </Link>
            <Dialog
              open={isEditProfileOpen}
              onOpenChange={setIsEditProfileOpen}
            >
              <DialogTrigger asChild>
                <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group px-8 py-3'>
                  <Edit className='w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300' />
                  수정하기
                </Button>
              </DialogTrigger>
              <ProfileChangeModal />
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileView;
