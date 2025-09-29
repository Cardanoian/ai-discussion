import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/useTheme';

interface ThemeToggleButtonProps {
  className?: string;
}

const ThemeToggleButton = ({ className = '' }: ThemeToggleButtonProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      onClick={toggleTheme}
      className={`group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 px-4 py-2 hover:scale-105 transform ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className='w-4 h-4 group-hover:scale-110 transition-transform duration-300 text-white' />
          <span className='ml-2 hidden md:inline font-medium text-white group-hover:text-white/90 transition-colors duration-300'>
            라이트
          </span>
        </>
      ) : (
        <>
          <Moon className='w-4 h-4 group-hover:scale-110 transition-transform duration-300 text-white' />
          <span className='ml-2 hidden md:inline font-medium text-white group-hover:text-white/90 transition-colors duration-300'>
            다크
          </span>
        </>
      )}
      <span className='sr-only'>테마 변경</span>
    </Button>
  );
};

export default ThemeToggleButton;
