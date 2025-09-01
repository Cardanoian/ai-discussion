import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  generateArguments,
  generateQuestionsAndAnswers,
} from '@/lib/geminiClient';
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
  BrainCircuit,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Subject {
  uuid: string;
  title: string;
  text: string;
}

interface Question {
  q: string;
  a: string;
}

const DocsView = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [position, setPosition] = useState<'favor' | 'against'>('favor');
  const [reasons, setReasons] = useState<string[]>(['']);
  const [questions, setQuestions] = useState<Question[]>([{ q: '', a: '' }]);
  const [isGeneratingArguments, setIsGeneratingArguments] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from('subjects').select('*');
      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data);
      }
    };
    fetchSubjects();
  }, []);

  const fetchDoc = useCallback(async () => {
    if (user && selectedSubject) {
      const { data, error } = await supabase
        .from('docs')
        .select('content, against')
        .eq('user_uuid', user.id)
        .eq('subject_id', selectedSubject)
        .eq('against', position === 'against')
        .maybeSingle();

      if (error) {
        console.error('Error fetching doc:', error);
        // 에러가 발생해도 기본값으로 초기화
        setReasons(['']);
        setQuestions([{ q: '', a: '' }]);
        return;
      }

      if (data && data.content) {
        const docData = data.content as {
          reasons: string[];
          questions: Question[];
        };
        setReasons(docData.reasons || ['']);
        setQuestions(docData.questions || [{ q: '', a: '' }]);
      } else {
        setReasons(['']);
        setQuestions([{ q: '', a: '' }]);
      }
    }
  }, [user, selectedSubject, position]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const handleAddReason = () => setReasons([...reasons, '']);
  const handleReasonChange = (index: number, value: string) => {
    const newReasons = [...reasons];
    newReasons[index] = value;
    setReasons(newReasons);
  };

  const handleAddQuestion = () =>
    setQuestions([...questions, { q: '', a: '' }]);
  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].q = value;
    setQuestions(newQuestions);
  };
  const handleAnswerChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].a = value;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!user || !selectedSubject) {
      alert('토론 주제를 먼저 선택해주세요.');
      return;
    }

    const doc = {
      reasons: reasons.filter((r) => r.trim() !== ''),
      questions: questions.filter(
        (q) => q.q.trim() !== '' || q.a.trim() !== ''
      ),
    };

    const upsertData = {
      user_uuid: user.id,
      subject_id: selectedSubject,
      content: doc,
      against: position === 'against',
    };

    // upsert는 user_uuid, subject_id, against 조합으로 unique constraint를 사용
    // id는 GENERATED ALWAYS이므로 포함하지 않음
    const { error } = await supabase
      .from('docs')
      .upsert(upsertData, {
        onConflict: 'user_uuid,subject_id,against',
      })
      .select();

    if (error) {
      console.error('Error saving doc:', error);
      alert('자료 저장에 실패했습니다.');
    } else {
      const positionText = position === 'favor' ? '찬성' : '반대';
      alert(`${positionText} 입장 자료가 성공적으로 저장되었습니다!`);
      // navigate('/main');
    }
  };

  const handleGenerateArguments = async () => {
    if (!selectedSubject) {
      alert('토론 주제를 먼저 선택해주세요.');
      return;
    }

    const selectedSubjectData = subjects.find(
      (s) => s.uuid === selectedSubject
    );
    if (!selectedSubjectData) {
      alert('선택된 주제 정보를 찾을 수 없습니다.');
      return;
    }

    setIsGeneratingArguments(true);
    try {
      const generatedArguments = await generateArguments(
        selectedSubjectData.title,
        reasons,
        position === 'against'
      );

      // 기존 근거에 AI 생성 근거 추가
      const newReasons = [...reasons];
      generatedArguments.forEach((arg) => {
        newReasons.push(arg);
      });
      setReasons(newReasons);

      alert(`AI가 ${generatedArguments.length}개의 근거를 생성했습니다!`);
    } catch (error) {
      console.error('AI 근거 생성 오류:', error);
      alert(
        error instanceof Error ? error.message : 'AI 근거 생성에 실패했습니다.'
      );
    } finally {
      setIsGeneratingArguments(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedSubject) {
      alert('토론 주제를 먼저 선택해주세요.');
      return;
    }

    const selectedSubjectData = subjects.find(
      (s) => s.uuid === selectedSubject
    );
    if (!selectedSubjectData) {
      alert('선택된 주제 정보를 찾을 수 없습니다.');
      return;
    }

    const validReasons = reasons.filter((r) => r.trim() !== '');
    if (validReasons.length === 0) {
      alert('먼저 주장 근거를 작성해주세요.');
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const generatedQA = await generateQuestionsAndAnswers(
        selectedSubjectData.title,
        validReasons,
        questions
      );

      // 기존 질문/답변에 AI 생성 질문/답변 추가
      const newQuestions = [...questions];
      generatedQA.forEach((qa) => {
        newQuestions.push(qa);
      });
      setQuestions(newQuestions);

      alert(`AI가 ${generatedQA.length}개의 질문/답변을 생성했습니다!`);
    } catch (error) {
      console.error('AI 질문/답변 생성 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'AI 질문/답변 생성에 실패했습니다.'
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleCancel = () => navigate('/main');

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <Card className='animate-in fade-in-50 duration-500'>
        <CardHeader>
          <CardTitle className='flex items-center text-2xl'>
            <BrainCircuit className='w-8 h-8 mr-3 text-primary' />
            토론 자료 준비
          </CardTitle>
          <CardDescription>
            선택한 주제에 대한 주장과 예상 질문/답변을 미리 작성하여 토론을
            대비하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
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
                내 주장
                <Button
                  onClick={handleGenerateArguments}
                  disabled={!selectedSubject || isGeneratingArguments}
                  variant='outline'
                  size='sm'
                >
                  {isGeneratingArguments ? (
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
                <Textarea
                  key={index}
                  value={reason}
                  onChange={(e) => handleReasonChange(index, e.target.value)}
                  placeholder={`근거 #${index + 1}`}
                  className='min-h-[100px]'
                />
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
                    isGeneratingQuestions ||
                    reasons.filter((r) => r.trim()).length === 0
                  }
                  variant='outline'
                  size='sm'
                >
                  {isGeneratingQuestions ? (
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
                <div key={index} className='p-4 border rounded-lg space-y-2'>
                  <Input
                    value={item.q}
                    onChange={(e) =>
                      handleQuestionChange(index, e.target.value)
                    }
                    placeholder={`예상 질문 #${index + 1}`}
                  />
                  <Textarea
                    value={item.a}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
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
            <Button variant='ghost' onClick={handleCancel}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              취소
            </Button>
            <Button onClick={handleSave}>
              <Save className='w-4 h-4 mr-2' />
              저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocsView;
