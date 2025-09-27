import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { validateScore } from '@/types/scoring';
import type { HumanScore } from '@/types/scoring';

interface RefereeScoreModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitScores: (scores: HumanScore) => void;
  agreePlayerName: string;
  disagreePlayerName: string;
}

const RefereeScoreModal = ({
  isOpen,
  onOpenChange,
  onSubmitScores,
  agreePlayerName,
  disagreePlayerName,
}: RefereeScoreModalProps) => {
  const [agreeScore, setAgreeScore] = useState<string>('');
  const [disagreeScore, setDisagreeScore] = useState<string>('');
  const [errors, setErrors] = useState<{
    agree?: string;
    disagree?: string;
  }>({});

  const handleScoreChange = (value: string, type: 'agree' | 'disagree') => {
    if (type === 'agree') {
      setAgreeScore(value);
    } else {
      setDisagreeScore(value);
    }

    // 실시간 유효성 검사
    const numValue = parseInt(value);
    if (value && !isNaN(numValue)) {
      const validation = validateScore(numValue);
      setErrors((prev) => ({
        ...prev,
        [type]: validation.isValid ? undefined : validation.error,
      }));
    } else if (value) {
      setErrors((prev) => ({
        ...prev,
        [type]: '유효한 숫자를 입력해주세요.',
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }
  };

  const handleSubmit = () => {
    const agreeNum = parseInt(agreeScore);
    const disagreeNum = parseInt(disagreeScore);

    // 최종 유효성 검사
    const agreeValidation = validateScore(agreeNum);
    const disagreeValidation = validateScore(disagreeNum);

    if (!agreeValidation.isValid || !disagreeValidation.isValid) {
      setErrors({
        agree: agreeValidation.error,
        disagree: disagreeValidation.error,
      });
      return;
    }

    // 점수 제출
    onSubmitScores({
      agree: agreeNum,
      disagree: disagreeNum,
    });

    // 모달 닫기 및 초기화
    onOpenChange(false);
    setAgreeScore('');
    setDisagreeScore('');
    setErrors({});
  };

  const isValid =
    agreeScore &&
    disagreeScore &&
    !errors.agree &&
    !errors.disagree &&
    !isNaN(parseInt(agreeScore)) &&
    !isNaN(parseInt(disagreeScore));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600'>
            인간 심판 채점
          </DialogTitle>
          <DialogDescription className='text-base'>
            AI 채점이 완료되었습니다. 각 팀의 점수를 입력해주세요.
            <br />
            <span className='text-sm text-muted-foreground'>
              (AI 40% + 인간 심판 60% = 최종 점수)
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* 찬성측 점수 입력 */}
          <Card className='bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-blue-600 dark:text-blue-400'>
                찬성측: {agreePlayerName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='agree-score' className='text-sm font-medium'>
                  점수 (0-100점)
                </Label>
                <Input
                  id='agree-score'
                  type='number'
                  min='0'
                  max='100'
                  value={agreeScore}
                  onChange={(e) => handleScoreChange(e.target.value, 'agree')}
                  placeholder='점수를 입력하세요'
                  className={`${
                    errors.agree
                      ? 'border-red-500 focus:border-red-500'
                      : agreeScore && !errors.agree
                      ? 'border-green-500 focus:border-green-500'
                      : ''
                  }`}
                />
                {errors.agree && (
                  <div className='flex items-center gap-1 text-sm text-red-600'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.agree}
                  </div>
                )}
                {agreeScore && !errors.agree && (
                  <div className='flex items-center gap-1 text-sm text-green-600'>
                    <CheckCircle className='w-4 h-4' />
                    유효한 점수입니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 반대측 점수 입력 */}
          <Card className='bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg text-red-600 dark:text-red-400'>
                반대측: {disagreePlayerName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <Label htmlFor='disagree-score' className='text-sm font-medium'>
                  점수 (0-100점)
                </Label>
                <Input
                  id='disagree-score'
                  type='number'
                  min='0'
                  max='100'
                  value={disagreeScore}
                  onChange={(e) =>
                    handleScoreChange(e.target.value, 'disagree')
                  }
                  placeholder='점수를 입력하세요'
                  className={`${
                    errors.disagree
                      ? 'border-red-500 focus:border-red-500'
                      : disagreeScore && !errors.disagree
                      ? 'border-green-500 focus:border-green-500'
                      : ''
                  }`}
                />
                {errors.disagree && (
                  <div className='flex items-center gap-1 text-sm text-red-600'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.disagree}
                  </div>
                )}
                {disagreeScore && !errors.disagree && (
                  <div className='flex items-center gap-1 text-sm text-green-600'>
                    <CheckCircle className='w-4 h-4' />
                    유효한 점수입니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='mr-2'
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0'
          >
            점수 제출
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefereeScoreModal;
