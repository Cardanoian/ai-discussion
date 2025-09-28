import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabaseClient';
import { generateDiscussionHelp } from '@/lib/apiClient';
import type { Message } from '@/models/Discussion';
import type { UserProfile } from '@/models/Profile';
import printDev from '@/utils/printDev';

// 서버에서 받는 메시지 타입
interface ServerMessage {
  sender: 'system' | 'judge' | 'agree' | 'disagree';
  text: string;
  timestamp?: number;
}

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
  const [userRole, setUserRole] = useState<'player' | 'spectator' | 'referee'>(
    'spectator'
  );
  const [userPosition, setUserPosition] = useState<'agree' | 'disagree' | null>(
    null
  );
  const [players, setPlayers] = useState<
    Array<{
      userId: string;
      role: 'player' | 'spectator' | 'referee';
      position?: 'agree' | 'disagree';
      displayName?: string;
    }>
  >([]);
  const [isRefereeScoreModalOpen, setIsRefereeScoreModalOpen] = useState(false);
  const [refereeScoreData, setRefereeScoreData] = useState<{
    agreePlayerName: string;
    disagreePlayerName: string;
    aiResult: {
      agree: { score: number; good: string; bad: string };
      disagree: { score: number; good: string; bad: string };
      winner: string;
    };
  } | null>(null);
  const [battleResult, setBattleResult] = useState<{
    agree: { score: number; good: string; bad: string };
    disagree: { score: number; good: string; bad: string };
    winner: string;
    finalScore?: { agree: number; disagree: number };
    humanScore?: { agree: number; disagree: number };
    aiScore?: { agree: number; disagree: number };
  } | null>(null);
  const [isBattleResultModalOpen, setIsBattleResultModalOpen] = useState(false);
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
  // 서버 주도 타이머 시스템으로 변경 - 클라이언트 타이머 제거
  // 이제 서버에서 timer_update 이벤트로 시간 정보를 받아서 표시만 함

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
      printDev.log(`사용자 자료 미리 로드 시작:${{ roomId, currentUserId }}`);

      // roomId로부터 실제 subject_id를 가져오기 위해 rooms 테이블 조회
      printDev.log(`rooms 테이블 조회 시작, roomId: ${roomId}`);
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('subject_id')
        .eq('uuid', roomId)
        .single();

      printDev.error(`rooms 테이블 조회 결과:, ${{ roomData, roomError }}`);

      if (roomError || !roomData?.subject_id) {
        printDev.error('방 정보 조회 오류:', roomError);
        printDev.log('빈 자료로 설정하고 종료');
        // 방 정보를 가져올 수 없는 경우 빈 자료로 설정
        setUserDocs({
          agree: { reasons: [], questions: [] },
          disagree: { reasons: [], questions: [] },
        });
        return;
      }

      const actualSubjectId = roomData.subject_id;
      printDev.log(`실제 subject_id: ${actualSubjectId}`);

      // 실제 subject_id로 사용자 자료 조회
      printDev.log(
        `사용자 자료 조회 시작:, ${{ actualSubjectId, currentUserId }}`
      );
      const [agreeData, disagreeData] = await Promise.all([
        getUserDocs(actualSubjectId, false), // 찬성 자료
        getUserDocs(actualSubjectId, true), // 반대 자료
      ]);

      printDev.log(`사용자 자료 조회 완료: ${{ agreeData, disagreeData }}`);

      const processedDocs = {
        agree: agreeData || { reasons: [], questions: [] },
        disagree: disagreeData || { reasons: [], questions: [] },
      };

      setUserDocs(processedDocs);
      printDev.log(`사용자 자료 미리 로드 완료: ${processedDocs}`);
    } catch (error) {
      printDev.error('자료 미리 로드 오류:', error);
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
      printDev.error('roomId가 없습니다.');
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
        printDev.error('사용자 인증 정보가 없습니다.');
        navigate('/');
        return;
      }

      const currentUserId = user.id;
      setUserId(currentUserId);

      // 사용자 프로필 정보 로드 (한 번만)
      try {
        printDev.log(`사용자 프로필 조회 시작: ${currentUserId}`);
        const { data: profile, error } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_uuid', currentUserId)
          .single();

        if (error) {
          printDev.error('사용자 프로필 조회 오류:', error);
          // 기본값으로 설정 (실버 등급)
          const defaultProfile = {
            user_uuid: currentUserId,
            display_name: user.email || 'Unknown',
            rating: 1600,
            wins: 0,
            loses: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_admin: false,
          };
          setUserProfile(defaultProfile);
          printDev.log(`기본 프로필 설정: ${defaultProfile}`);
        } else if (profile) {
          setUserProfile(profile);
          // 사용자 역할 설정 (관리자면 심판, 아니면 일단 관전자로 시작)
          setUserRole(profile.is_admin ? 'referee' : 'spectator');
          printDev.log(`사용자 프로필 로드 완료: ${profile}`);
        } else {
          printDev.log('프로필 데이터가 없음');
          // 프로필이 없는 경우에도 기본값 설정
          const defaultProfile = {
            user_uuid: currentUserId,
            display_name: user.email || 'Unknown',
            rating: 1600,
            wins: 0,
            loses: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_admin: false,
          };
          setUserProfile(defaultProfile);
          printDev.log(`기본 프로필 설정 (데이터 없음): ${defaultProfile}`);
        }
      } catch (error) {
        printDev.error('사용자 프로필 로드 오류:', error);
        // catch 블록에서도 기본값 설정
        const defaultProfile = {
          user_uuid: currentUserId,
          display_name: user.email || 'Unknown',
          rating: 1600,
          wins: 0,
          loses: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_admin: false,
        };
        setUserProfile(defaultProfile);
        printDev.log(`기본 프로필 설정 (catch): ${defaultProfile}`);
      }

      const newSocket = io(serverUrl, {
        path: import.meta.env.DEV ? '/socket.io' : '/server/socket.io',
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        printDev.log(`Connected to discussion socket server: ${newSocket.id}`);

        // 연결 후 즉시 룸에 join하고 discussionView 준비 완료 신호 보내기
        printDev.log(`룸에 join: ${stateRoomId}`);
        newSocket.emit('join_discussion_room', {
          roomId: stateRoomId,
          userId: currentUserId,
        });

        printDev.log('discussionView 준비 완료, 서버에 신호 전송');
        newSocket.emit('discussion_view_ready', {
          roomId: stateRoomId,
          userId: currentUserId,
        });

        // 서버에서 메시지 목록 요청
        printDev.log('서버에서 메시지 목록 요청');
        newSocket.emit('get_messages', { roomId: stateRoomId });
      });

      newSocket.on('disconnect', () => {
        printDev.log('소켓 연결 해제됨');
      });

      newSocket.on('connect_error', (error) => {
        printDev.error('소켓 연결 오류:', error);
      });

      // 서버에서 관리하는 메시지 목록 업데이트 리스너
      newSocket.on('messages_updated', (serverMessages: ServerMessage[]) => {
        printDev.log(
          `받은 messages_updated: ${serverMessages.length}개 메시지`
        );

        // 서버 메시지를 클라이언트 메시지 형식으로 변환
        const clientMessages: Message[] = serverMessages.map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

        setMessages(clientMessages);
      });

      // AI judge messages - stage 정보 업데이트용
      newSocket.on(
        'ai_judge_message',
        (data: { message: string; stage: number }) => {
          printDev.log(`받은 ai_judge_message: ${data}`);
          setCurrentStage(data.stage);

          // 토론 시작 시 사용자 자료 미리 로드
          if (data.stage === 1) {
            preloadUserDocs(stateRoomId, currentUserId);
          }
        }
      );

      // Listen for player list updates to determine user role
      newSocket.on(
        'player_list_updated',
        (data: {
          players: Array<{
            userId: string;
            role: 'player' | 'spectator' | 'referee';
            position?: 'agree' | 'disagree';
            displayName?: string;
          }>;
        }) => {
          printDev.log(`받은 player_list_updated: ${JSON.stringify(data)}`);

          // 현재 사용자가 플레이어 목록에 있는지 확인
          const currentUserPlayer = data.players.find(
            (p) => p.userId === currentUserId
          );

          // 플레이어 목록 상태 업데이트
          setPlayers(data.players);

          if (currentUserPlayer) {
            printDev.log(
              `현재 사용자 정보: ${JSON.stringify(currentUserPlayer)}`
            );

            // 사용자 역할 설정 - 관리자가 아닌 경우에만 역할 변경
            if (!userProfile?.is_admin) {
              const newRole = currentUserPlayer.role as
                | 'player'
                | 'spectator'
                | 'referee';
              if (newRole !== userRole) {
                setUserRole(newRole);
                printDev.log(`역할 변경: ${userRole} -> ${newRole}`);
              }
            }

            // 사용자 입장 설정 (agree/disagree)
            if (currentUserPlayer.position) {
              const position =
                currentUserPlayer.position === 'agree' ? 'agree' : 'disagree';
              if (position !== userPosition) {
                setUserPosition(position);
                printDev.log(`사용자 입장 설정: ${position}`);
              }
            }
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
          printDev.log(
            `받은 turn_info: ${data}, 현재 userId: ${currentUserId}`
          );
          setCurrentTurn(data.currentPlayerId);
          const isMyNewTurn = data.currentPlayerId === currentUserId;
          setIsMyTurn(isMyNewTurn);
          setCurrentStage(data.stage);
          setStageDescription(data.stageDescription);

          // 서버 주도 타이머 시스템에서는 클라이언트가 타이머를 직접 제어하지 않음
          // 서버에서 timer_update 이벤트로 시간 정보를 받아서 표시
        }
      );

      // Listen for battle results
      newSocket.on(
        'battle_result',
        (result: {
          agree: { score: number; good: string; bad: string };
          disagree: { score: number; good: string; bad: string };
          winner: string;
          finalScore?: { agree: number; disagree: number };
          humanScore?: { agree: number; disagree: number };
          aiScore?: { agree: number; disagree: number };
        }) => {
          printDev.log(`받은 battle_result: ${JSON.stringify(result)}`);
          setBattleEnded(true);
          setBattleResult(result);
          setIsBattleResultModalOpen(true);
        }
      );

      // Listen for penalty applied events
      newSocket.on(
        'penalty_applied',
        (data: {
          userId: string;
          penaltyPoints: number;
          maxPenaltyPoints: number;
          message: string;
        }) => {
          printDev.log(`받은 penalty_applied: ${data}`);

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
        }
      );

      // Listen for overtime granted events
      newSocket.on(
        'overtime_granted',
        (data: { userId: string; overtimeLimit: number; message: string }) => {
          printDev.log(`받은 overtime_granted: ${data}`);
        }
      );

      // Listen for battle errors
      newSocket.on('battle_error', (error: string) => {
        printDev.log(`받은 battle_error: ${error}`);
      });

      // Listen for referee score modal request
      newSocket.on(
        'show_referee_score_modal',
        (data: {
          agreePlayerName: string;
          disagreePlayerName: string;
          aiResult: {
            agree: { score: number; good: string; bad: string };
            disagree: { score: number; good: string; bad: string };
            winner: string;
          };
        }) => {
          printDev.log(`받은 show_referee_score_modal: ${data}`);
          setRefereeScoreData(data);
          setIsRefereeScoreModalOpen(true);
        }
      );

      // Listen for server timer updates
      newSocket.on(
        'timer_update',
        (data: {
          currentPlayerId: string;
          roundTimeRemaining: number;
          totalTimeRemaining: number;
          isOvertime: boolean;
          overtimeRemaining: number;
          roundTimeLimit: number;
          totalTimeLimit: number;
        }) => {
          printDev.log(`받은 timer_update: ${data}`);

          // 서버에서 받은 시간 정보로 타이머 상태 업데이트
          setTimerState({
            roundTimeRemaining: data.roundTimeRemaining,
            totalTimeRemaining: data.totalTimeRemaining,
            isRunning: data.currentPlayerId === currentUserId,
            isOvertime: data.isOvertime,
            overtimeRemaining: data.overtimeRemaining,
            roundTimeLimit: data.roundTimeLimit,
            totalTimeLimit: data.totalTimeLimit,
          });
        }
      );
    };

    initializeDiscussion();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      // 서버 주도 타이머 시스템으로 변경 - 클라이언트 타이머 정리 불필요
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
    printDev.log(
      `sendMessage 호출됨: ${{
        socket: !!socket,
        message: message.trim(),
        isMyTurn,
        battleEnded,
        roomId,
        userId,
      }}`
    );

    if (socket && message.trim() && isMyTurn && !battleEnded && roomId) {
      printDev.log(
        `send_message 이벤트 발송: ${{
          roomId,
          userId,
          message: message.trim(),
        }}`
      );
      socket.emit('send_message', { roomId, userId, message: message.trim() });
    } else {
      printDev.log(
        `sendMessage 조건 실패: ${{
          hasSocket: !!socket,
          hasMessage: !!message.trim(),
          isMyTurn,
          battleEnded,
          hasRoomId: !!roomId,
          hasUserId: !!userId,
        }}`
      );
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
        printDev.error('사용자 입장을 파악할 수 없습니다.');
        return null;
      }

      // 토론 주제 정보 가져오기
      const subject = await getCurrentSubject();
      if (!subject) {
        printDev.error('토론 주제를 가져올 수 없습니다.');
        return null;
      }

      // 캐시된 사용자 자료 사용 (성능 최적화)
      let docs: { reasons: string[]; questions: { q: string; a: string }[] } = {
        reasons: [],
        questions: [],
      };
      if (userDocs) {
        docs = userPosition === 'agree' ? userDocs.agree : userDocs.disagree;
        printDev.log(`캐시된 자료 사용: ${{ userPosition, docs }}`);
      } else {
        // 캐시가 없는 경우 빈 배열 사용 (DB 재조회 방지)
        printDev.log(`캐시가 없어 빈 자료로 AI 호출: ${{ userPosition }}`);
        docs = { reasons: [], questions: [] };
      }

      // 캐시된 사용자 등급 정보 사용 (기본값: 1600 - 실버 등급)
      const userRating = userProfile?.rating || 1600;
      printDev.log(`사용자 등급 정보: ${{ userRating, userProfile }}`);

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
      printDev.error('AI 도움 요청 오류:', error);
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
      printDev.error('주제 정보 가져오기 오류:', error);
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
        printDev.error('사용자 자료 조회 오류:', error);
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
      printDev.error('사용자 자료 가져오기 오류:', error);
      return { reasons: [], questions: [] };
    }
  };

  /**
   * 심판 점수 제출 함수
   */
  const handleRefereeScoreSubmit = (scores: {
    agree: number;
    disagree: number;
  }) => {
    if (socket && roomId && userId) {
      socket.emit('referee_submit_scores', {
        roomId,
        scores,
        refereeId: userId,
      });
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
    userRole,
    setUserRole,
    userPosition,
    socket,
    roomId,
    userId,
    isRefereeScoreModalOpen,
    setIsRefereeScoreModalOpen,
    refereeScoreData,
    handleRefereeScoreSubmit,
    battleResult,
    isBattleResultModalOpen,
    setIsBattleResultModalOpen,
    userProfile,
    players, // players 상태 추가
  };
};
