import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { getRankTitle } from '@/lib/constants';
import type { UserProfile } from '@/models/Profile';
import { useUserProfile } from '@/contexts/useUserProfile';

interface ProfileButtonProps {
  userProfile: UserProfile;
  className?: string;
}

const ProfileButton = ({ userProfile, className = '' }: ProfileButtonProps) => {
  const { handleLogout } = useUserProfile();
  const rankInfo = getRankTitle(userProfile.rating);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={`flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:bg-white/95 dark:hover:bg-slate-700/90 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:scale-105 transform transition-all duration-300 px-4 py-2 hover:shadow-xl hover:shadow-blue-500/30 ${className}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${rankInfo.color} shadow-md hover:shadow-lg transition-shadow duration-300`}
          >
            <UserIcon className='w-4 h-4 text-white' />
          </div>
          <span className='font-medium'>{userProfile.display_name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 p-2'
      >
        <DropdownMenuLabel className='px-2 py-1.5'>내 계정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to='/profile'>
          <DropdownMenuItem className='px-2 py-2'>
            <UserIcon className='w-4 h-4 mr-2' />
            프로필
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className='text-red-600 dark:text-red-400 px-2 py-2'
        >
          <LogOut className='w-4 h-4 mr-2' />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
