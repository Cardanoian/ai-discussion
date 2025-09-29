import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { useDocsViewModel } from '@/viewmodels/DocsViewModel';

const DocsView = () => {
  const {
    // State
    subjects,
    selectedSubject,
    position,
    reasons,
    questions,
    isGenerating,

    // Setters
    setSelectedSubject,
    setPosition,

    // Handlers
    handleAddReason,
    handleReasonChange,
    handleRemoveReason,
    handleAddQuestion,
    handleQuestionChange,
    handleAnswerChange,
    handleRemoveQuestion,
    handleSave,
    handleGenerateArguments,
    handleGenerateQuestions,
    handleCancel,
  } = useDocsViewModel();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative container mx-auto p-4 md:p-8'>
        <Card className='animate-in fade-in-50 duration-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10'>
          <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg'></div>

          <CardHeader className='relative'>
            <CardTitle className='flex items-center text-3xl'>
              <div className='relative mr-4'>
                <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-30 animate-pulse'></div>
              </div>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500'>
                토론 자료 준비
              </span>
            </CardTitle>
            <CardDescription className='text-muted-foreground/80 text-lg leading-relaxed mt-1'>
              선택한 주제에 대한 주장과 예상 질문/답변을 미리 작성하여 토론을
              대비하세요.
              <br />
              <span className='text-sm opacity-75'>
                AI가 더 강력한 논리를 만들어드립니다
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className='relative space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='subject-select'>토론 주제</Label>
                <Select
                  onValueChange={setSelectedSubject}
                  value={selectedSubject}
                >
                  <SelectTrigger id='subject-select'>
                    <SelectValue placeholder='토론 주제를 선택하세요' />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.uuid} value={subject.uuid}>
                        {subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>입장 선택</Label>
                <RadioGroup
                  value={position}
                  onValueChange={(value) =>
                    setPosition(value as 'favor' | 'against')
                  }
                  className='flex space-x-6'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='favor' id='favor' />
                    <Label htmlFor='favor'>찬성</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem value='against' id='against' />
                    <Label htmlFor='against'>반대</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='text-xl flex items-center justify-between'>
                  내 근거
                  <Button
                    onClick={handleGenerateArguments}
                    disabled={!selectedSubject || isGenerating}
                    variant='outline'
                    size='sm'
                  >
                    {isGenerating ? (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    ) : (
                      <Sparkles className='w-4 h-4 mr-2' />
                    )}
                    AI 도움
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {reasons.map((reason, index) => (
                  <div key={index} className='relative'>
                    <Textarea
                      value={reason}
                      onChange={(e) =>
                        handleReasonChange(index, e.target.value)
                      }
                      placeholder={`근거 #${index + 1}`}
                      className='min-h-[100px] pr-10'
                    />
                    <Button
                      onClick={() => handleRemoveReason(index)}
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button onClick={handleAddReason} variant='outline' size='sm'>
                  <PlusCircle className='w-4 h-4 mr-2' />
                  근거 추가
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-xl flex items-center justify-between'>
                  예상 질문 및 답변
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={
                      !selectedSubject ||
                      isGenerating ||
                      reasons.filter((r) => r.trim()).length === 0
                    }
                    variant='outline'
                    size='sm'
                  >
                    {isGenerating ? (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    ) : (
                      <Sparkles className='w-4 h-4 mr-2' />
                    )}
                    AI 도움
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {questions.map((item, index) => (
                  <div
                    key={index}
                    className='relative p-4 border rounded-lg space-y-2'
                  >
                    <Button
                      onClick={() => handleRemoveQuestion(index)}
                      variant='ghost'
                      size='sm'
                      className='absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                    <Input
                      value={item.q}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      placeholder={`예상 질문 #${index + 1}`}
                      className='pr-10'
                    />
                    <Textarea
                      value={item.a}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                      placeholder={`답변 #${index + 1}`}
                    />
                  </div>
                ))}
                <Button onClick={handleAddQuestion} variant='outline' size='sm'>
                  <PlusCircle className='w-4 h-4 mr-2' />
                  질문 추가
                </Button>
              </CardContent>
            </Card>

            <div className='flex justify-end space-x-4 mt-8'>
              <Button
                onClick={handleCancel}
                className='bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-300 group'
              >
                <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300' />
                뒤로
              </Button>
              <Button
                onClick={handleSave}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group'
              >
                <Save className='w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300' />
                저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocsView;
