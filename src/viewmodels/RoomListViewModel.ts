import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabaseClient';
import type { Player, Room, Subject } from '@/models/Room';

const serverUrl = import.meta.env.VITE_SERVER_URL;

/**
 * 대기실 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 대기실 관련 상태와 함수들을 포함한 객체
 */
export const useRoomListViewModel = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Room modal states
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [myPosition, setMyPosition] = useState<'agree' | 'disagree' | null>(
    null
  );
  const [isChangeSubjectOpen, setIsChangeSubjectOpen] = useState(false);
  const [battleCountdown, setBattleCountdown] = useState<number>(0);

  // 로딩 상태들
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);
  const [isGettingReady, setIsGettingReady] = useState(false);
  const [isChangingSubject, setIsChangingSubject] = useState(false);

  /**
   * 플레이어의 표시명을 가져오는 헬퍼 함수
   * @param player - 플레이어 객체
   * @returns 플레이어의 표시명 또는 사용자 ID
   */
  const getPlayerDisplayName = (player: Player) => {
    if (player.displayname && player.displayname.trim() !== '') {
      return player.displayname;
    }
    return player.userId;
  };

  /**
   * 토론 시작을 처리하고 토론 화면으로 이동하는 함수
   * @param roomId - 방 ID (선택사항)
   */
  const handleBattleStart = useCallback(
    (roomId?: string) => {
      if (roomId) {
        navigate('/discussion', { state: { roomId } });
      } else {
        navigate('/discussion');
      }
    },
    [navigate]
  );

  useEffect(() => {
    // Get user authentication info
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();

    // Subjects will be fetched via Socket.IO after connection

    if (import.meta.env.DEV) {
      console.log('Socket.IO 연결 시도:', {
        serverUrl,
        path: '/server/socket.io',
      });
    }

    const newSocket = io(serverUrl, {
      path: '/server/socket.io',
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('Socket.IO 연결 성공:', newSocket.id);
      }

      // Get rooms
      newSocket.emit('get_rooms', (data: { rooms: Room[] }) => {
        if (import.meta.env.DEV) {
          console.log('방 목록 수신:', data.rooms);
        }
        setRooms(data.rooms);
      });

      // Get subjects via Socket.IO
      newSocket.emit('get_subjects', (data: { subjects: Subject[] }) => {
        if (import.meta.env.DEV) {
          console.log('주제 목록 수신:', data.subjects);
        }
        setSubjects(data.subjects);
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO 연결 오류:', error);
    });

    newSocket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('Socket.IO 연결 해제:', reason);
      }
    });

    newSocket.on('rooms_update', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);
    });

    newSocket.on('room_update', (updatedRoom: Room) => {
      setCurrentRoom(updatedRoom);

      // Update my position based on room data
      const me = updatedRoom.players.find((p) => p.userId === userId);
      if (me && me.position) {
        setMyPosition(me.position);
      }
    });

    newSocket.on('battle_countdown', (countdown: number) => {
      setBattleCountdown(countdown);
      if (countdown === 0) {
        setTimeout(() => {
          handleBattleStart();
        }, 500);
      }
    });

    // Handle battle start event from server
    newSocket.on('battle_start', (room: Room) => {
      // Close room modal and navigate to discussion
      setIsRoomModalOpen(false);
      handleBattleStart(room.roomId);
    });

    // Handle position selection confirmation
    newSocket.on(
      'position_selected',
      (data: { position: 'agree' | 'disagree' | null }) => {
        setMyPosition(data.position);
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, [handleBattleStart, userId]);

  /**
   * 새로운 방을 생성하는 함수
   */
  const handleCreateRoom = () => {
    if (selectedSubject && socket && userId && !isCreatingRoom) {
      setIsCreatingRoom(true);
      socket.emit(
        'create_room',
        { userId, subjectId: selectedSubject },
        (ack: { room?: Room; error?: string }) => {
          setIsCreatingRoom(false);
          if (ack.room) {
            setCurrentRoom(ack.room);
            setIsRoomModalOpen(true);
            setIsCreateRoomOpen(false);
            setSelectedSubject('');
          } else {
            alert(ack.error);
          }
        }
      );
    }
  };

  /**
   * 기존 방에 참가하는 함수
   * @param roomId - 참가할 방의 ID
   */
  const handleJoinRoom = (roomId: string) => {
    if (socket && userId && !isJoiningRoom) {
      setIsJoiningRoom(true);
      socket.emit(
        'join_room',
        { roomId, userId },
        (ack: { room?: Room; error?: string }) => {
          setIsJoiningRoom(false);
          if (ack.room) {
            setCurrentRoom(ack.room);
            setIsRoomModalOpen(true);
          } else {
            alert(ack.error);
          }
        }
      );
    }
  };

  /**
   * 현재 방에서 나가는 함수
   */
  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave_room', { roomId: currentRoom.roomId, userId });
    }
    setIsRoomModalOpen(false);
    setCurrentRoom(null);
    setMyPosition(null);
  };

  /**
   * 방의 토론 주제를 변경하는 함수
   */
  const handleChangeSubject = () => {
    if (selectedSubject && socket && currentRoom && !isChangingSubject) {
      setIsChangingSubject(true);
      socket.emit(
        'change_room_subject',
        { roomId: currentRoom.roomId, subjectId: selectedSubject },
        (ack: { success?: boolean; error?: string }) => {
          setIsChangingSubject(false);
          if (ack.success) {
            setIsChangeSubjectOpen(false);
          } else {
            alert(ack.error || '주제 변경에 실패했습니다.');
          }
        }
      );
    }
  };

  /**
   * 토론 입장(찬성/반대)을 선택하는 함수
   * @param position - 선택할 입장 ('agree' 또는 'disagree')
   */
  const handlePositionSelect = (position: 'agree' | 'disagree') => {
    if (!socket || !currentRoom || !userId || isSelectingPosition) {
      return;
    }

    setIsSelectingPosition(true);

    // 같은 입장을 다시 클릭하면 선택 취소
    if (myPosition === position) {
      socket.emit('select_position', {
        roomId: currentRoom.roomId,
        userId,
        position: null,
      });
    } else {
      socket.emit('select_position', {
        roomId: currentRoom.roomId,
        userId,
        position,
      });
    }

    // 입장 선택은 빠르게 처리되므로 짧은 시간 후 로딩 해제
    setTimeout(() => {
      setIsSelectingPosition(false);
    }, 500);
  };

  /**
   * 토론 준비 완료를 알리는 함수
   */
  const handleReady = () => {
    if (socket && currentRoom && userId && myPosition && !isGettingReady) {
      setIsGettingReady(true);
      socket.emit('player_ready', { roomId: currentRoom.roomId, userId });

      // 준비 완료는 빠르게 처리되므로 짧은 시간 후 로딩 해제
      setTimeout(() => {
        setIsGettingReady(false);
      }, 500);
    }
  };

  /**
   * 메인 화면으로 이동하는 함수
   */
  const handleGoToMain = () => {
    navigate('/');
  };

  return {
    // State
    rooms,
    subjects,
    selectedSubject,
    isCreateRoomOpen,
    userId,
    isRoomModalOpen,
    currentRoom,
    myPosition,
    isChangeSubjectOpen,
    battleCountdown,

    // Loading states
    isCreatingRoom,
    isJoiningRoom,
    isSelectingPosition,
    isGettingReady,
    isChangingSubject,

    // Setters
    setSelectedSubject,
    setIsCreateRoomOpen,
    setIsRoomModalOpen,
    setIsChangeSubjectOpen,

    // Handlers
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleChangeSubject,
    handlePositionSelect,
    handleReady,
    handleGoToMain,
    getPlayerDisplayName,
  };
};
