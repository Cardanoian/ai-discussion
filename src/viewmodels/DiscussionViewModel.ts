import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabaseClient';
import { generateDiscussionHelp } from '@/lib/apiClient';
import type { Message } from '@/models/Discussion';
import type { UserProfile } from '@/models/Profile';

const serverUrl = import.meta.env.VITE_SERVER_URL;

/**
 * 토론 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 토론 관련 상태와 함수들을 포함한 객체
 */
export const useDiscussionViewModel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [isRequestingAiHelp, setIsRequestingAiHelp] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageDescription, setStageDescription] = useState<string>('');
  const [userDocs, setUserDocs] = useState<{
    agree: { reasons: string[]; questions: { q: string; a: string }[] };
    disagree: { reasons: string[]; questions: { q: string; a: string }[] };
  } | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [timerInfo, setTimerInfo] = useState<{
    myPenaltyPoints: number;
    opponentPenaltyPoints: number;
    maxPenaltyPoints: number;
  }>({
    myPenaltyPoints: 0,
    opponentPenaltyPoints: 0,
    maxPenaltyPoints: 18,
  });
  const [timerState, setTimerState] = useState<{
    roundTimeRemaining: number; // 라운드 남은 시간 (초)
    totalTimeRemaining: number; // 전체 남은 시간 (초)
    isRunning: boolean;
    isOvertime: boolean;
    overtimeRemaining: number; // 연장시간 남은 시간 (초)
    roundTimeLimit: number; // 라운드 제한 시간 (초)
    totalTimeLimit: number; // 전체 제한 시간 (초)
  }>({
    roundTimeRemaining: 120, // 2분
    totalTimeRemaining: 300, // 5분
    isRunning: false,
    isOvertime: false,
    overtimeRemaining: 30, // 30초
    roundTimeLimit: 120,
    totalTimeLimit: 300,
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 타이머를 시작하는 함수
   */
  const startTimer = (roundLimit: number, totalRemaining: number) => {
    setTimerState((prev) => ({
      ...prev,
      roundTimeRemaining: roundLimit,
      totalTimeRemaining: totalRemaining,
      isRunning: true,
      isOvertime: false,
      roundTimeLimit: roundLimit,
    }));

    // 기존 타이머 정리
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // 새 타이머 시작
    timerIntervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        if (!prev.isRunning) return prev;

        const newRoundTime = prev.roundTimeRemaining - 1;
        const newTotalTime = prev.totalTimeRemaining - 1;

        // 라운드 시간 초과 체크
        if (newRoundTime <= 0 && !prev.isOvertime) {
          // 서버에 시간 초과 신호 전송
          if (socket && roomId && userId) {
            socket.emit('time_overflow', {
              roomId,
              userId,
              type: 'round',
            });
          }

          return {
            ...prev,
            roundTimeRemaining: 0,
            totalTimeRemaining: Math.max(0, newTotalTime),
            isOvertime: true,
            overtimeRemaining: 30,
          };
        }

        // 연장시간 체크
        if (prev.isOvertime) {
          const newOvertimeTime = prev.overtimeRemaining - 1;

          if (newOvertimeTime <= 0) {
            // 연장시간도 초과
            if (socket && roomId && userId) {
              socket.emit('time_overflow', {
                roomId,
                userId,
                type: 'overtime',
              });
            }

            return {
              ...prev,
              overtimeRemaining: 0,
              isRunning: false,
            };
          }

          return {
            ...prev,
            totalTimeRemaining: Math.max(0, newTotalTime),
            overtimeRemaining: newOvertimeTime,
          };
        }

        // 전체 시간 초과 체크
        if (newTotalTime <= 0) {
          if (socket && roomId && userId) {
            socket.emit('time_overflow', {
              roomId,
              userId,
              type: 'total',
            });
          }

          return {
            ...prev,
            roundTimeRemaining: Math.max(0, newRoundTime),
            totalTimeRemaining: 0,
            isRunning: false,
          };
        }

        return {
          ...prev,
          roundTimeRemaining: Math.max(0, newRoundTime),
          totalTimeRemaining: Math.max(0, newTotalTime),
        };
      });
    }, 1000);
  };

  /**
   * 타이머를 정지하는 함수
   */
  const stopTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  /**
   * 시간을 포맷하는 함수 (초 -> MM:SS)
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 사용자의 토론 자료를 미리 로드하는 함수
   */
  const preloadUserDocs = async (roomId: string, currentUserId: string) => {
    setIsLoadingDocs(true);
    try {
      console.log('사용자 자료 미리 로드 시작:', { roomId, currentUserId });

      // roomId로부터 실제 subject_id를 가져오기 위해 rooms 테이블 조회
      console.log('rooms 테이블 조회 시작, roomId:', roomId);
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('subject_id')
        .eq('uuid', roomId)
        .single();

      console.log('rooms 테이블 조회 결과:', { roomData, roomError });

      if (roomError || !roomData?.subject_id) {
        console.error('방 정보 조회 오류:', roomError);
        console.log('빈 자료로 설정하고 종료');
        // 방 정보를 가져올 수 없는 경우 빈 자료로 설정
        setUserDocs({
          agree: { reasons: [], questions: [] },
          disagree: { reasons: [], questions: [] },
        });
        return;
      }

      const actualSubjectId = roomData.subject_id;
      console.log('실제 subject_id:', actualSubjectId);

      // 실제 subject_id로 사용자 자료 조회
      console.log('사용자 자료 조회 시작:', { actualSubjectId, currentUserId });
      const [agreeData, disagreeData] = await Promise.all([
        getUserDocs(actualSubjectId, false), // 찬성 자료
        getUserDocs(actualSubjectId, true), // 반대 자료
      ]);

      console.log('사용자 자료 조회 완료:', { agreeData, disagreeData });

      const processedDocs = {
        agree: agreeData || { reasons: [], questions: [] },
        disagree: disagreeData || { reasons: [], questions: [] },
      };

      setUserDocs(processedDocs);
      console.log('사용자 자료 미리 로드 완료:', processedDocs);
    } catch (error) {
      console.error('자료 미리 로드 오류:', error);
      setUserDocs({
        agree: { reasons: [], questions: [] },
        disagree: { reasons: [], questions: [] },
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    // Get roomId from navigation state
    const stateRoomId = location.state?.roomId;
    if (!stateRoomId) {
      console.error('roomId가 없습니다.');
      navigate('/waiting-room');
      return;
    }

    setRoomId(stateRoomId);

    // 새로운 토론 시작 시 메시지 초기화
    setMessages([]);
    setBattleEnded(false);
    setCurrentTurn('');
    setIsMyTurn(false);
    setCurrentStage(0);
    setStageDescription('');

    // Get user authentication info and initialize socket
    const initializeDiscussion = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('사용자 인증 정보가 없습니다.');
        navigate('/');
        return;
      }

      const currentUserId = user.id;
      setUserId(currentUserId);

      // 사용자 프로필 정보 로드 (한 번만)
      try {
        console.log('사용자 프로필 조회 시작:', currentUserId);
        const { data: profile, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_uuid', currentUserId)
          .single();

        if (error) {
          console.error('사용자 프로필 조회 오류:', error);
          // 기본값으로 설정 (실버 등급)
          const defaultProfile = {
            user_uuid: currentUserId,
            display_name: user.email || 'Unknown',
            rating: 1600,
            wins: 0,
            loses: 0,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUserProfile(defaultProfile);
          console.log('기본 프로필 설정:', defaultProfile);
        } else if (profile) {
          setUserProfile(profile);
          console.log('사용자 프로필 로드 완료:', profile);
        } else {
          console.log('프로필 데이터가 없음');
          // 프로필이 없는 경우에도 기본값 설정
          const defaultProfile = {
            user_uuid: currentUserId,
            display_name: user.email || 'Unknown',
            rating: 1600,
            wins: 0,
            loses: 0,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUserProfile(defaultProfile);
          console.log('기본 프로필 설정 (데이터 없음):', defaultProfile);
        }
      } catch (error) {
        console.error('사용자 프로필 로드 오류:', error);
        // catch 블록에서도 기본값 설정
        const defaultProfile = {
          user_uuid: currentUserId,
          display_name: user.email || 'Unknown',
          rating: 1600,
          wins: 0,
          loses: 0,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUserProfile(defaultProfile);
        console.log('기본 프로필 설정 (catch):', defaultProfile);
      }

      const newSocket = io(serverUrl, {
        path: '/server/socket.io',
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to discussion socket server:', newSocket.id);

        // 연결 후 즉시 룸에 join하고 discussionView 준비 완료 신호 보내기
        console.log('룸에 join:', stateRoomId);
        newSocket.emit('join_discussion_room', {
          roomId: stateRoomId,
          userId: currentUserId,
        });

        console.log('discussionView 준비 완료, 서버에 신호 전송');
        newSocket.emit('discussion_view_ready', {
          roomId: stateRoomId,
          userId: currentUserId,
        });
      });

      newSocket.on('disconnect', () => {
        console.log('소켓 연결 해제됨');
      });

      newSocket.on('connect_error', (error) => {
        console.error('소켓 연결 오류:', error);
      });

      // Listen for battle info messages
      newSocket.on('battle_info', (message: string) => {
        console.log('받은 battle_info:', message);
        setMessages((prev) => {
          // 중복 시스템 메시지 방지
          const isDuplicate = prev.some(
            (msg) => msg.sender === 'system' && msg.text === message
          );

          if (isDuplicate) {
            console.log('중복 시스템 메시지 감지, 무시:', message);
            return prev;
          }

          return [...prev, { sender: 'system', text: message }];
        });
      });

      // Listen for AI judge messages
      newSocket.on(
        'ai_judge_message',
        (data: { message: string; stage: number }) => {
          console.log('받은 ai_judge_message:', data);
          setMessages((prev) => {
            // 중복 AI 심판 메시지 방지
            const isDuplicate = prev.some(
              (msg) => msg.sender === 'judge' && msg.text === data.message
            );

            if (isDuplicate) {
              console.log('중복 AI 심판 메시지 감지, 무시:', data);
              return prev;
            }

            return [...prev, { sender: 'judge', text: data.message }];
          });
          setCurrentStage(data.stage);

          // 토론 시작 시 사용자 자료 미리 로드
          if (data.stage === 1) {
            preloadUserDocs(stateRoomId, currentUserId);
          }
        }
      );

      // Listen for turn information
      newSocket.on(
        'turn_info',
        (data: {
          currentPlayerId: string;
          stage: number;
          message: string;
          stageDescription: string;
        }) => {
          console.log('받은 turn_info:', data, '현재 userId:', currentUserId);
          setCurrentTurn(data.currentPlayerId);
          const isMyNewTurn = data.currentPlayerId === currentUserId;
          setIsMyTurn(isMyNewTurn);
          setCurrentStage(data.stage);
          setStageDescription(data.stageDescription);

          // 내 턴이 시작되면 타이머 시작
          if (isMyNewTurn) {
            startTimer(120, 300); // 2분 라운드, 5분 전체
          } else {
            stopTimer(); // 상대방 턴이면 타이머 정지
          }

          setMessages((prev) => {
            // 중복 턴 정보 메시지 방지
            const isDuplicate = prev.some(
              (msg) => msg.sender === 'system' && msg.text === data.message
            );

            if (isDuplicate) {
              console.log('중복 턴 정보 메시지 감지, 무시:', data);
              return prev;
            }

            return [...prev, { sender: 'system', text: data.message }];
          });
        }
      );

      // Listen for new messages from players
      newSocket.on(
        'new_message',
        (data: { userId: string; message: string; sender: string }) => {
          setMessages((prev) => {
            // 중복 메시지 방지: 같은 내용의 메시지가 이미 있는지 확인
            const isDuplicate = prev.some(
              (msg) =>
                msg.sender === data.sender &&
                msg.text === data.message &&
                prev.indexOf(msg) === prev.length - 1 // 마지막 메시지와 비교
            );

            if (isDuplicate) {
              console.log('중복 메시지 감지, 무시:', data);
              return prev;
            }

            return [
              ...prev,
              { sender: data.sender as 'pro' | 'con', text: data.message },
            ];
          });
        }
      );

      // Listen for battle results (내부 처리용, UI에는 표시하지 않음)
      newSocket.on('battle_result', () => {
        setBattleEnded(true);
        // JSON 형식은 클라이언트에 표시하지 않고, ai_judge_message로만 표시
      });

      // Listen for penalty applied events
      newSocket.on(
        'penalty_applied',
        (data: {
          userId: string;
          penaltyPoints: number;
          maxPenaltyPoints: number;
          message: string;
        }) => {
          console.log('받은 penalty_applied:', data);

          // 감점 정보 업데이트
          setTimerInfo((prev) => ({
            ...prev,
            myPenaltyPoints:
              data.userId === currentUserId
                ? data.penaltyPoints
                : prev.myPenaltyPoints,
            opponentPenaltyPoints:
              data.userId !== currentUserId
                ? data.penaltyPoints
                : prev.opponentPenaltyPoints,
            maxPenaltyPoints: data.maxPenaltyPoints,
          }));

          // 감점 메시지 표시
          setMessages((prev) => [
            ...prev,
            { sender: 'system', text: data.message },
          ]);
        }
      );

      // Listen for overtime granted events
      newSocket.on(
        'overtime_granted',
        (data: { userId: string; overtimeLimit: number; message: string }) => {
          console.log('받은 overtime_granted:', data);

          // 연장시간 메시지 표시
          setMessages((prev) => [
            ...prev,
            { sender: 'system', text: data.message },
          ]);
        }
      );

      // Listen for battle errors
      newSocket.on('battle_error', (error: string) => {
        console.log('받은 battle_error:', error);
        setMessages((prev) => [
          ...prev,
          { sender: 'system', text: `오류: ${error}` },
        ]);
      });
    };

    initializeDiscussion();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      // 타이머 정리
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [navigate]); // location.state 의존성 제거

  // 개선된 자동 스크롤 로직 - 입력창이 보이도록 최적화
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current;

        // 방법 1: 스크롤 앵커 포인트 사용 (채팅 영역 내에서만 스크롤)
        const messagesEnd = scrollContainer.querySelector('#messages-end');
        if (messagesEnd) {
          messagesEnd.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // 'end' 대신 'nearest' 사용으로 과도한 스크롤 방지
            inline: 'nearest',
          });
          return;
        }

        // 방법 2: 마지막 자식 요소로 스크롤 (채팅 영역 내에서만)
        const lastChild = scrollContainer.lastElementChild;
        if (lastChild && lastChild.id !== 'messages-end') {
          lastChild.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // 'end' 대신 'nearest' 사용
            inline: 'nearest',
          });
          return;
        }

        // 방법 3: 스크롤 컨테이너의 하단으로 스크롤 (입력창 고려하지 않음)
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight - scrollContainer.clientHeight,
          behavior: 'smooth',
        });
      }
    };

    // 메시지가 있을 때만 스크롤 실행
    if (messages.length > 0) {
      // DOM 업데이트 후 스크롤 실행을 위한 지연
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  /**
   * 메시지를 서버로 전송하는 함수
   * @param message - 전송할 메시지 내용
   */
  const sendMessage = (message: string) => {
    console.log('sendMessage 호출됨:', {
      socket: !!socket,
      message: message.trim(),
      isMyTurn,
      battleEnded,
      roomId,
      userId,
    });

    if (socket && message.trim() && isMyTurn && !battleEnded && roomId) {
      console.log('send_message 이벤트 발송:', {
        roomId,
        userId,
        message: message.trim(),
      });
      socket.emit('send_message', { roomId, userId, message: message.trim() });
    } else {
      console.log('sendMessage 조건 실패:', {
        hasSocket: !!socket,
        hasMessage: !!message.trim(),
        isMyTurn,
        battleEnded,
        hasRoomId: !!roomId,
        hasUserId: !!userId,
      });
    }
  };

  /**
   * AI 도움을 요청하는 함수
   * @returns AI의 제안 내용을 담은 Promise (실패 시 null)
   */
  const requestAiHelp = async (): Promise<string | null> => {
    if (!isMyTurn || battleEnded || !userId) {
      return null;
    }

    setIsRequestingAiHelp(true);

    try {
      // 현재 사용자의 입장 파악 (찬성/반대)
      const userPosition = getUserPosition();
      if (!userPosition) {
        console.error('사용자 입장을 파악할 수 없습니다.');
        return null;
      }

      // 토론 주제 정보 가져오기
      const subject = await getCurrentSubject();
      if (!subject) {
        console.error('토론 주제를 가져올 수 없습니다.');
        return null;
      }

      // 캐시된 사용자 자료 사용 (성능 최적화)
      let docs: { reasons: string[]; questions: { q: string; a: string }[] } = {
        reasons: [],
        questions: [],
      };
      if (userDocs) {
        docs = userPosition === 'agree' ? userDocs.agree : userDocs.disagree;
        console.log('캐시된 자료 사용:', { userPosition, docs });
      } else {
        // 캐시가 없는 경우 빈 배열 사용 (DB 재조회 방지)
        console.log('캐시가 없어 빈 자료로 AI 호출:', { userPosition });
        docs = { reasons: [], questions: [] };
      }

      // 캐시된 사용자 등급 정보 사용 (기본값: 1600 - 실버 등급)
      const userRating = userProfile?.rating || 1600;
      console.log('사용자 등급 정보:', { userRating, userProfile });

      // AI에게 도움 요청 (사용자 등급 정보 포함)
      const suggestion = await generateDiscussionHelp(
        subject.title,
        userPosition,
        currentStage,
        stageDescription,
        messages,
        docs.reasons,
        docs.questions,
        userRating
      );

      return suggestion;
    } catch (error) {
      console.error('AI 도움 요청 오류:', error);
      return null;
    } finally {
      setIsRequestingAiHelp(false);
    }
  };

  /**
   * 현재 사용자의 입장(찬성/반대)을 파악하는 함수
   */
  const getUserPosition = (): 'agree' | 'disagree' | null => {
    // 현재 턴 정보를 통해 사용자 입장 파악
    if (isMyTurn) {
      // 시스템 메시지에서 현재 사용자의 입장 정보 추출
      const systemMessages = messages.filter((msg) => msg.sender === 'system');
      const lastTurnMessage = systemMessages
        .filter((msg) => msg.text.includes('님의') && msg.text.includes('차례'))
        .slice(-1)[0];

      if (lastTurnMessage) {
        if (lastTurnMessage.text.includes('찬성측')) {
          return 'agree';
        } else if (lastTurnMessage.text.includes('반대측')) {
          return 'disagree';
        }
      }
    }

    // AI 심판 메시지에서 사용자 입장 추출 (초기 메시지 분석)
    // 현재 구조상 사용자 이름을 직접 비교하기 어려우므로
    // 턴 정보를 우선적으로 활용

    // 기본값으로 찬성 반환 (추후 개선 필요)
    return 'agree';
  };

  /**
   * 현재 토론 주제 정보를 가져오는 함수
   */
  const getCurrentSubject = async () => {
    try {
      // roomId를 통해 현재 방의 주제 정보 가져오기
      // 실제로는 서버에서 주제 정보를 받아와야 하지만,
      // 현재는 메시지에서 주제 정보를 추출
      const judgeMessages = messages.filter((msg) => msg.sender === 'judge');
      if (judgeMessages.length > 0) {
        const firstJudgeMessage = judgeMessages[0].text;
        const titleMatch = firstJudgeMessage.match(/주제는 "([^"]+)"/);
        if (titleMatch) {
          return {
            uuid: roomId, // 임시로 roomId 사용
            title: titleMatch[1],
            text: firstJudgeMessage,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('주제 정보 가져오기 오류:', error);
      return null;
    }
  };

  /**
   * 사용자의 준비 자료를 가져오는 함수
   */
  const getUserDocs = async (subjectId: string, isAgainst: boolean) => {
    try {
      const { data, error } = await supabase
        .from('docs')
        .select('content')
        .eq('user_uuid', userId)
        .eq('subject_id', subjectId)
        .eq('against', isAgainst)
        .single();

      if (error) {
        console.error('사용자 자료 조회 오류:', error);
        return { reasons: [], questions: [] };
      }

      if (data?.content) {
        return {
          reasons: data.content.reasons || [],
          questions: data.content.questions || [],
        };
      }

      return { reasons: [], questions: [] };
    } catch (error) {
      console.error('사용자 자료 가져오기 오류:', error);
      return { reasons: [], questions: [] };
    }
  };

  return {
    messages,
    scrollAreaRef,
    isMyTurn,
    currentTurn,
    battleEnded,
    sendMessage,
    requestAiHelp,
    isRequestingAiHelp,
    currentStage,
    stageDescription,
    userDocs,
    isLoadingDocs,
    timerInfo,
    timerState,
    formatTime,
  };
};
