import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { generateArgument, generateQuestionAndAnswer } from '@/lib/apiClient';
import type { User } from '@supabase/supabase-js';
import type { Subject, Question } from '@/models/Docs';
import printDev from '@/utils/printDev';

/**
 * 토론 자료 관리 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 토론 자료 관련 상태와 함수들을 포함한 객체
 */
export const useDocsViewModel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [position, setPosition] = useState<'favor' | 'against'>('favor');
  const [reasons, setReasons] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at');
      if (error) {
        printDev.error('Error fetching subjects:', error);
      } else {
        setSubjects(data);
      }
    };
    fetchSubjects();
  }, []);

  /**
   * 사용자의 토론 자료 문서를 가져오는 함수
   */
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
        printDev.error('Error fetching doc:', error);
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

  /**
   * 새로운 근거를 추가하는 함수
   */
  const handleAddReason = () => setReasons([...reasons, '']);

  /**
   * 특정 인덱스의 근거 내용을 변경하는 함수
   * @param index - 변경할 근거의 인덱스
   * @param value - 새로운 근거 내용
   */
  const handleReasonChange = (index: number, value: string) => {
    const newReasons = [...reasons];
    newReasons[index] = value;
    setReasons(newReasons);
  };

  /**
   * 특정 인덱스의 근거를 삭제하는 함수
   * @param index - 삭제할 근거의 인덱스
   */
  const handleRemoveReason = (index: number) => {
    const newReasons = reasons.filter((_, i) => i !== index);
    setReasons(newReasons);
  };

  /**
   * 새로운 질문을 추가하는 함수
   */
  const handleAddQuestion = () =>
    setQuestions([...questions, { q: '', a: '' }]);

  /**
   * 특정 인덱스의 질문 내용을 변경하는 함수
   * @param index - 변경할 질문의 인덱스
   * @param value - 새로운 질문 내용
   */
  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].q = value;
    setQuestions(newQuestions);
  };

  /**
   * 특정 인덱스의 답변 내용을 변경하는 함수
   * @param index - 변경할 답변의 인덱스
   * @param value - 새로운 답변 내용
   */
  const handleAnswerChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].a = value;
    setQuestions(newQuestions);
  };

  /**
   * 특정 인덱스의 질문을 삭제하는 함수
   * @param index - 삭제할 질문의 인덱스
   */
  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  /**
   * 토론 자료를 데이터베이스에 저장하는 함수
   */
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
      printDev.error('Error saving doc:', error);
      alert('자료 저장에 실패했습니다.');
    } else {
      const positionText = position === 'favor' ? '찬성' : '반대';
      alert(`${positionText} 입장 자료가 성공적으로 저장되었습니다!`);
    }
  };

  /**
   * AI를 사용하여 토론 근거를 생성하는 함수
   */
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

    setIsGenerating(true);
    try {
      const generatedArgument = await generateArgument(
        position === 'favor',
        selectedSubjectData.title,
        reasons
      );
      setReasons((prev) => [...prev, generatedArgument]);

      alert(`AI가 근거를 1개 생성했습니다!`);
    } catch (error) {
      printDev.error('AI 근거 생성 오류:', error);
      alert(
        error instanceof Error ? error.message : 'AI 근거 생성에 실패했습니다.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * AI를 사용하여 질문과 답변을 생성하는 함수
   */
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

    setIsGenerating(true);
    try {
      const generatedQA = await generateQuestionAndAnswer(
        position === 'favor',
        selectedSubjectData.title,
        validReasons,
        questions
      );
      setQuestions((prev) => [...prev, generatedQA]);

      alert(`AI가 질문/답변을 1개 생성했습니다!`);
    } catch (error) {
      printDev.error('AI 질문/답변 생성 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'AI 질문/답변 생성에 실패했습니다.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 자료 작성을 취소하고 메인 화면으로 이동하는 함수
   */
  const handleCancel = () => navigate('/main');

  return {
    // State
    user,
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
  };
};
