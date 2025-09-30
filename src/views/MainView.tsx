import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  BrainCircuit,
  ArrowRight,
  User,
} from "lucide-react";
import { useMainViewModel } from "@/viewmodels/MainViewModel";
import ProfileButton from "@/components/ProfileButton";
import { useState, useEffect } from "react";

const MainView = () => {
  const { userProfile, loading } = useMainViewModel();
  const navigate = useNavigate();
  const [showAvatarDialog, setShowAvatarDialog] =
    useState(false);

  useEffect(() => {
    // 로딩이 완료되고 사용자 프로필이 있는데 avatar_url이 없으면 다이얼로그 표시
    if (
      !loading &&
      userProfile &&
      !userProfile.avatar_url
    ) {
      setShowAvatarDialog(true);
    }
  }, [loading, userProfile]);

  const handleGoToProfile = () => {
    setShowAvatarDialog(false);
    navigate("/profile");
  };

  return (
    <>
      {/* 아바타 등록 안내 다이얼로그 */}
      <Dialog
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <DialogTitle>프로필 설정 필요</DialogTitle>
            </div>
            <DialogDescription className="space-y-2">
              <p>프로필 사진이 아직 설정되지 않았습니다.</p>
              <p className="text-sm">
                프로필 페이지에서 아바타를 생성하고 개성
                있는 프로필을 완성해보세요!
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAvatarDialog(false)}>
              나중에 하기
            </Button>
            <Button
              onClick={handleGoToProfile}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              프로필로 가기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative flex flex-col h-screen p-4 md:p-8">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-20 animate-pulse"></div>
                <BrainCircuit className="relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500">
                AI 토론 배틀
              </h1>
            </div>
            {!loading && userProfile && (
              <ProfileButton userProfile={userProfile} />
            )}
          </header>

          <main className="flex-grow grid md:grid-cols-2 gap-8 animate-in fade-in-50 duration-700">
            <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-[1.02] flex flex-col">
              {/* Card gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative">
                <CardTitle className="flex items-center text-xl">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>
                  자료 만들기
                  <Sparkles className="w-4 h-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
                </CardTitle>
                <CardDescription className="text-muted-foreground/80 leading-relaxed">
                  토론 주제에 대한 당신의 논리를 미리
                  준비하고 정리해 보세요.
                  <br />
                  <span className="text-sm opacity-75">
                    AI가 도움을 드립니다
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex-grow flex items-end">
                <Link to="/docs" className="w-full">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group">
                    준비하러 가기
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:scale-[1.02] flex flex-col">
              {/* Card gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative">
                <CardTitle className="flex items-center text-xl">
                  <div className="relative mr-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </div>
                  대전하기
                  <Sparkles className="w-4 h-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
                </CardTitle>
                <CardDescription className="text-muted-foreground/80 leading-relaxed">
                  준비된 자료를 바탕으로 다른 사용자와
                  실시간 토론 배틀을 시작하세요.
                  <br />
                  <span className="text-sm opacity-75">
                    실력을 겨뤄보세요
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex-grow flex items-end">
                <Link to="/waiting-room" className="w-full">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group">
                    대전하러 가기
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainView;
