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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LogOut,
  User as UserIcon,
  Trophy,
  Target,
  TrendingUp,
  ArrowLeft,
  Crown,
  Zap,
  Camera,
  Edit,
} from 'lucide-react';
import { useProfileViewModel } from '@/viewmodels/ProfileViewModel';

const ProfileView = () => {
  const {
    // State
    user,
    userProfile,
    userStats,
    loading,
    uploading,
    isEditNicknameOpen,
    newNickname,
    rank,

    // Setters
    setIsEditNicknameOpen,
    setNewNickname,

    // Handlers
    handleAvatarUpload,
    handleNicknameUpdate,
    handleLogout,
    getDisplayName,
  } = useProfileViewModel();

  // 승급까지 필요한 점수 계산
  const getPointsToPromotion = (rating: number): number => {
    if (rating >= 3000) return 0; // 이미 최고 등급
    if (rating >= 2800) return 3000 - rating;
    if (rating >= 2500) return 2800 - rating;
    if (rating >= 2200) return 2500 - rating;
    if (rating >= 1800) return 2200 - rating;
    if (rating >= 1600) return 1800 - rating;
    return 1600 - rating; // 브론즈에서 실버로
  };

  // 강등까지 남은 점수 계산
  const getPointsToDemotion = (rating: number): number => {
    if (rating >= 3000) return rating - 3000;
    if (rating >= 2800) return rating - 2800;
    if (rating >= 2500) return rating - 2500;
    if (rating >= 2200) return rating - 2200;
    if (rating >= 1800) return rating - 1800;
    if (rating >= 1600) return rating - 1600;
    return 0; // 브론즈는 0까지
  };

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
          <div className='flex items-center space-x-4'>
            <Link to='/main'>
              <Button
                variant='ghost'
                size='sm'
                className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70'
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                메인으로
              </Button>
            </Link>
            <h1 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500'>
              내 프로필
            </h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300'
                >
                  <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
                    <UserIcon className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium'>
                    {user.user_metadata.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'
              >
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='text-red-600 dark:text-red-400'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className='flex-grow animate-in fade-in-50 duration-700'>
          {/* User Info Card */}
          <div className='mb-8'>
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

              <CardHeader className='relative text-center pb-4'>
                <div className='flex flex-col items-center space-y-4'>
                  <div className='relative group'>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${rank.color} rounded-full blur-lg opacity-30 animate-pulse`}
                    ></div>
                    <div
                      className={`relative w-24 h-24 bg-gradient-to-r ${rank.color} rounded-full flex items-center justify-center shadow-lg overflow-hidden`}
                    >
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt='프로필 사진'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <UserIcon className='w-12 h-12 text-white' />
                      )}
                    </div>

                    {/* Upload button overlay */}
                    <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer'>
                      <label htmlFor='avatar-upload' className='cursor-pointer'>
                        <Camera className='w-6 h-6 text-white' />
                        <input
                          id='avatar-upload'
                          type='file'
                          accept='image/*'
                          onChange={handleAvatarUpload}
                          className='hidden'
                          disabled={uploading}
                        />
                      </label>
                    </div>

                    {uploading && (
                      <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className='flex items-center justify-center space-x-2 mb-2'>
                      <CardTitle className='text-2xl'>
                        {getDisplayName()}
                      </CardTitle>
                      <Dialog
                        open={isEditNicknameOpen}
                        onOpenChange={setIsEditNicknameOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='p-1 h-auto hover:bg-white/20 dark:hover:bg-slate-800/20'
                            onClick={() =>
                              setNewNickname(userProfile?.display_name || '')
                            }
                          >
                            <Edit className='w-4 h-4 text-muted-foreground hover:text-foreground' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                          <DialogHeader>
                            <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
                              표시명 편집
                            </DialogTitle>
                            <DialogDescription>
                              표시될 이름을 입력하세요. 비워두면 기본 이름이
                              표시됩니다.
                            </DialogDescription>
                          </DialogHeader>
                          <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                              <Label
                                htmlFor='displayname'
                                className='text-right'
                              >
                                표시명
                              </Label>
                              <Input
                                id='displayname'
                                value={newNickname}
                                onChange={(e) => setNewNickname(e.target.value)}
                                className='col-span-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'
                                placeholder='표시명을 입력하세요'
                                maxLength={20}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type='submit'
                              onClick={handleNicknameUpdate}
                              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
                            >
                              저장
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className='flex items-center justify-center space-x-2'>
                      <Crown
                        className={`w-5 h-5 bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}
                      />
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
                  {userStats.rating}
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
        </main>

        {/* Bottom info */}
        <div className='mt-8 flex justify-center'>
          <div className='flex items-center space-x-6 text-sm text-muted-foreground bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20'>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></div>
              실시간 업데이트
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse delay-300'></div>
              레이팅 시스템
            </div>
            <div className='flex items-center'>
              <div className='w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse delay-700'></div>
              랭킹 시스템
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
