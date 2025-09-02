import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { supabase } from '@/lib/supabaseClient';
import {
  LogOut,
  User as UserIcon,
  Trophy,
  Target,
  TrendingUp,
  ArrowLeft,
  Crown,
  Zap,
  Award,
  Camera,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface UserStats {
  rating: number;
  wins: number;
  loses: number;
  total_games: number;
  win_rate: number;
}

interface UserProfile {
  user_uuid: string;
  display_name: string | null;
  rating: number;
  wins: number;
  loses: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const ProfileView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    rating: 1500,
    wins: 0,
    loses: 0,
    total_games: 0,
    win_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserStats(user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserStats = async (userId: string) => {
    try {
      setLoading(true);

      // 사용자 통계 조회
      const { data: stats, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_uuid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error);
        return;
      }

      if (stats) {
        setUserProfile(stats);
        const totalGames = stats.wins + stats.loses;
        const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        setUserStats({
          rating: stats.rating || 1500,
          wins: stats.wins || 0,
          loses: stats.loses || 0,
          total_games: totalGames,
          win_rate: winRate,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (userProfile?.avatar_url) {
        const oldFileName = userProfile.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        alert(`업로드 실패: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ avatar_url: publicUrl })
        .eq('user_uuid', user?.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert(`프로필 업데이트 실패: ${updateError.message}`);
        return;
      }

      // Refresh user data
      if (user) {
        await fetchUserStats(user.id);
      }

      alert('프로필 사진이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getRankTitle = (rating: number) => {
    if (rating >= 3000)
      return {
        title: '그랜드마스터',
        color: 'from-red-300 to-red-500',
        textColor: 'text-red-500 dark:text-red-300',
      };
    if (rating >= 2800)
      return {
        title: '마스터',
        color: 'from-purple-300 to-purple-500',
        textColor: 'text-purple-500 dark:text-purple-300',
      };
    if (rating >= 2500)
      return {
        title: '다이아몬드',
        color: 'from-blue-400 to-cyan-500',
        textColor: 'text-blue-400 dark:text-cyan-500',
      };
    if (rating >= 2200)
      return {
        title: '플래티넘',
        color: 'from-cyan-300 to-cyan-500',
        textColor: 'text-cyan-500 dark:text-cyan-300',
      };
    if (rating >= 1800)
      return {
        title: '골드',
        color: 'from-yellow-300 to-yellow-500',
        textColor: 'text-yellow-500 dark:text-yellow-300',
      };
    if (rating >= 1600)
      return {
        title: '실버',
        color: 'from-gray-300 to-gray-500',
        textColor: 'text-gray-500 dark:text-gray-300',
      };
    return {
      title: '브론즈',
      color: 'from-orange-600 to-orange-800',
      textColor: 'text-orange-800 dark:text-orange-600',
    };
  };

  const rank = getRankTitle(userStats.rating);

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
                    <CardTitle className='text-2xl mb-2'>
                      {user?.user_metadata.full_name || user?.email}
                    </CardTitle>
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

            {/* Wins */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <Award className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-green-600 dark:text-green-400'>
                  {userStats.wins}
                </CardTitle>
                <CardDescription>승리</CardDescription>
              </CardHeader>
            </Card>

            {/* Losses */}
            <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 transform hover:scale-[1.02]'>
              <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <CardHeader className='relative text-center'>
                <div className='flex justify-center mb-2'>
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                    <Target className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold text-red-600 dark:text-red-400'>
                  {userStats.loses}
                </CardTitle>
                <CardDescription>패배</CardDescription>
              </CardHeader>
            </Card>

            {/* Win Rate */}
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
                  {userStats.win_rate.toFixed(1)}%
                </CardTitle>
                <CardDescription>승률</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card className='group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

            <CardHeader className='relative'>
              <CardTitle className='flex items-center text-xl'>
                <div className='relative mr-3'>
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                  <Zap className='relative w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500' />
                </div>
                게임 통계
              </CardTitle>
            </CardHeader>
            <CardContent className='relative'>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1'>
                    {userStats.total_games}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    총 게임 수
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1'>
                    {userStats.total_games > 0
                      ? Math.round(userStats.rating / userStats.total_games)
                      : 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    게임당 평균 레이팅
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1'>
                    {userStats.total_games > 0
                      ? userStats.total_games - userStats.wins - userStats.loses
                      : 0}
                  </div>
                  <div className='text-sm text-muted-foreground'>무승부</div>
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
