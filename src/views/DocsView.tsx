import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save, PlusCircle, BrainCircuit } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Subject {
  uuid: string;
  title: string;
  text: string;
}

interface DocUpsertData {
  user_uuid: string;
  subject_id: string;
  content: {
    reasons: string[];
    questions: Question[];
  };
  against: boolean;
  id?: number; // Optional id for updates
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
  const [reasons, setReasons] = useState<string[]>(['']);
  const [questions, setQuestions] = useState<Question[]>([{ q: '', a: '' }]);
  const [docId, setDocId] = useState<number | null>(null);

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
      const { data } = await supabase
        .from('docs')
        .select('id, content') // Changed 'reason' to 'content'
        .eq('user_uuid', user.id)
        .eq('subject_uuid', selectedSubject)
        .single();

      if (data && data.content) {
        const docData = data.content as {
          reasons: string[];
          questions: Question[];
        };
        setReasons(docData.reasons || ['']);
        setQuestions(docData.questions || [{ q: '', a: '' }]);
        // Assuming 'id' is a BIGINT/number in the DB
        setDocId(data.id as number);
      } else {
        setReasons(['']);
        setQuestions([{ q: '', a: '' }]);
        setDocId(null);
      }
    }
  }, [user, selectedSubject]);

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

    const upsertData: DocUpsertData = {
      user_uuid: user.id,
      subject_id: selectedSubject,
      content: doc,
      against: false, // Defaulting to false as per previous implementation
    };

    // If docId exists, it means we are updating an existing record.
    // The 'id' column should be included for an update to work correctly with upsert.
    if (docId) {
      upsertData.id = docId;
    }

    const { error } = await supabase.from('docs').upsert(upsertData).select();

    if (error) {
      console.error('Error saving doc:', error);
      alert('자료 저장에 실패했습니다.');
    } else {
      alert('자료가 성공적으로 저장되었습니다!');
      navigate('/main');
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
          <Select onValueChange={setSelectedSubject} value={selectedSubject}>
            <SelectTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>내 주장</CardTitle>
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
              <CardTitle className='text-xl'>예상 질문 및 답변</CardTitle>
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
