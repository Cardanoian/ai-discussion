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
import { LogOut, ScrollText, Swords, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const MainView = () => {
  const [user, setUser] = useState<User | null>(null);
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
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">AI 토론 배틀</h1>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>{user.user_metadata.full_name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>프로필 (준비중)</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <main className="flex-grow grid md:grid-cols-2 gap-8 animate-in fade-in-50 duration-500">
        <Card className="hover:border-primary/80 transition-colors duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ScrollText className="w-6 h-6 mr-2 text-primary" />
              자료 만들기
            </CardTitle>
            <CardDescription>
              토론 주제에 대한 당신의 논리를 미리 준비하고 정리해 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/docs" className="w-full">
              <Button size="lg" className="w-full">
                준비하러 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/80 transition-colors duration-300 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Swords className="w-6 h-6 mr-2 text-primary" />
              대전하기
            </CardTitle>
            <CardDescription>
              준비된 자료를 바탕으로 다른 사용자와 실시간 토론 배틀을
              시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Link to="/waiting-room" className="w-full">
              <Button size="lg" className="w-full">
                대전하러 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MainView;
