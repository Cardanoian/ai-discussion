import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  generateArguments,
  generateQuestionsAndAnswers,
} from '@/lib/geminiClient';
import type { User } from '@supabase/supabase-js';
import type { Subject, Question } from '@/models/Docs';

export const useDocsViewModel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [position, setPosition] = useState<'favor' | 'against'>('favor');
  const [reasons, setReasons] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGeneratingArguments, setIsGeneratingArguments] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  // 주제 목록 가져오기
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

  // 문서 데이터 가져오기
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
        setReasons([]);
        setQuestions([]);
        return;
      }

      if (data && data.content) {
        const docData = data.content as {
          reasons: string[];
          questions: Question[];
        };
        setReasons(docData.reasons || []);
        setQuestions(docData.questions || []);
      } else {
        setReasons([]);
        setQuestions([]);
      }
    }
  }, [user, selectedSubject, position]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // 근거 관리 함수들
  const handleAddReason = () => setReasons([...reasons, '']);

  const handleReasonChange = (index: number, value: string) => {
    const newReasons = [...reasons];
    newReasons[index] = value;
    setReasons(newReasons);
  };

  const handleRemoveReason = (index: number) => {
    const newReasons = reasons.filter((_, i) => i !== index);
    setReasons(newReasons);
  };

  // 질문 관리 함수들
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

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // 저장 함수
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
    }
  };

  // AI 근거 생성
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

  // AI 질문/답변 생성
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

  // 취소 함수
  const handleCancel = () => navigate('/main');

  return {
    // State
    user,
    subjects,
    selectedSubject,
    position,
    reasons,
    questions,
    isGeneratingArguments,
    isGeneratingQuestions,

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
  };
};
