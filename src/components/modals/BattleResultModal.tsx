import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, Target, TrendingUp } from 'lucide-react';

interface BattleResult {
  agree: {
    score: number;
    good: string;
    bad: string;
  };
  disagree: {
    score: number;
    good: string;
    bad: string;
  };
  winner: string;
  // 인간 심판이 있을 때 추가되는 필드들
  finalScore?: {
    agree: number;
    disagree: number;
  };
  humanScore?: {
    agree: number;
    disagree: number;
  };
  aiScore?: {
    agree: number;
    disagree: number;
  };
}

interface BattleResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  result: BattleResult | null;
  agreePlayerName: string;
  disagreePlayerName: string;
  currentUserId: string;
}

const BattleResultModal = ({
  isOpen,
  onOpenChange,
  result,
  agreePlayerName,
  disagreePlayerName,
  currentUserId,
}: BattleResultModalProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const isWinner = result.winner === currentUserId;
  const hasHumanReferee = !!(
    result.humanScore &&
    result.aiScore &&
    result.finalScore
  );

  // 표시할 점수 결정 (인간 심판이 있으면 최종 점수, 없으면 AI 점수)
  const displayScore = hasHumanReferee
    ? result.finalScore!
    : { agree: result.agree.score, disagree: result.disagree.score };

  const winnerName =
    result.winner === currentUserId
      ? '나'
      : displayScore.agree > displayScore.disagree
      ? agreePlayerName
      : disagreePlayerName;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-20 animate-pulse'></div>
              <Trophy className='relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' />
            </div>
            <DialogTitle className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600'>
              토론 결과
            </DialogTitle>
          </div>
          <DialogDescription className='text-base'>
            {hasHumanReferee
              ? 'AI 심판과 인간 심판의 종합 채점 결과입니다.'
              : 'AI 심판의 채점 결과입니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* 승부 결과 */}
          <Card
            className={`${
              isWinner
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    isWinner
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {isWinner ? (
                    <Trophy className='w-5 h-5' />
                  ) : (
                    <Target className='w-5 h-5' />
                  )}
                  <span className='font-semibold text-lg'>
                    {isWinner ? '승리!' : '패배'}
                  </span>
                </div>
                <p className='mt-3 text-lg font-medium'>
                  {winnerName}의 승리입니다
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 점수 비교 */}
          <div className='grid grid-cols-2 gap-4'>
            {/* 찬성측 점수 */}
            <Card className='bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2'>
                  <Award className='w-5 h-5' />
                  찬성측: {agreePlayerName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center'>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      displayScore.agree
                    )}`}
                  >
                    {displayScore.agree}
                  </div>
                  <div className='text-sm text-muted-foreground mt-1'>
                    {hasHumanReferee ? '최종 점수' : '점'}
                  </div>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3'>
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(
                        displayScore.agree
                      )}`}
                      style={{ width: `${displayScore.agree}%` }}
                    ></div>
                  </div>
                  {hasHumanReferee && (
                    <div className='mt-3 text-xs text-muted-foreground space-y-1'>
                      <div>AI: {result.aiScore!.agree}점</div>
                      <div>인간 심판: {result.humanScore!.agree}점</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 반대측 점수 */}
            <Card className='bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg text-red-600 dark:text-red-400 flex items-center gap-2'>
                  <Award className='w-5 h-5' />
                  반대측: {disagreePlayerName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center'>
                  <div
                    className={`text-4xl font-bold ${getScoreColor(
                      displayScore.disagree
                    )}`}
                  >
                    {displayScore.disagree}
                  </div>
                  <div className='text-sm text-muted-foreground mt-1'>
                    {hasHumanReferee ? '최종 점수' : '점'}
                  </div>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3'>
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(
                        displayScore.disagree
                      )}`}
                      style={{ width: `${displayScore.disagree}%` }}
                    ></div>
                  </div>
                  {hasHumanReferee && (
                    <div className='mt-3 text-xs text-muted-foreground space-y-1'>
                      <div>AI: {result.aiScore!.disagree}점</div>
                      <div>인간 심판: {result.humanScore!.disagree}점</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상세 피드백 토글 */}
          <div className='text-center'>
            <Button
              variant='outline'
              onClick={() => setShowDetails(!showDetails)}
              className='flex items-center gap-2'
            >
              <TrendingUp className='w-4 h-4' />
              {showDetails ? '상세 피드백 숨기기' : '상세 피드백 보기'}
            </Button>
          </div>

          {/* 상세 피드백 */}
          {showDetails && (
            <div className='space-y-4'>
              {/* 찬성측 피드백 */}
              <Card className='bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'>
                <CardHeader>
                  <CardTitle className='text-lg text-blue-600 dark:text-blue-400'>
                    찬성측 피드백
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <h4 className='font-semibold text-green-600 dark:text-green-400 mb-2'>
                      👍 잘한 점
                    </h4>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {result.agree.good}
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-orange-600 dark:text-orange-400 mb-2'>
                      💡 개선점
                    </h4>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {result.agree.bad}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 반대측 피드백 */}
              <Card className='bg-red-50/30 dark:bg-red-900/10 border-red-200 dark:border-red-800'>
                <CardHeader>
                  <CardTitle className='text-lg text-red-600 dark:text-red-400'>
                    반대측 피드백
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <h4 className='font-semibold text-green-600 dark:text-green-400 mb-2'>
                      👍 잘한 점
                    </h4>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {result.disagree.good}
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-orange-600 dark:text-orange-400 mb-2'>
                      💡 개선점
                    </h4>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {result.disagree.bad}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0'
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BattleResultModal;
