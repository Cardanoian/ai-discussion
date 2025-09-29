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
      className={`flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/30 dark:border-slate-700/50 hover:bg-white/95 dark:hover:bg-slate-700/90 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:scale-105 transform transition-all duration-300 px-4 py-2 hover:shadow-xl hover:shadow-blue-500/30 ${className}`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className='w-4 h-4' />
          <span className='ml-2 hidden md:inline'>라이트</span>
        </>
      ) : (
        <>
          <Moon className='w-4 h-4' />
          <span className='ml-2 hidden md:inline'>다크</span>
        </>
      )}
      <span className='sr-only'>테마 변경</span>
    </Button>
  );
};

export default ThemeToggleButton;
