import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabaseClient';
import type { Player, Room, Subject } from '@/models/Room';

const serverUrl = import.meta.env.VITE_SERVER_URL;

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

  // Helper function to get display name for a player
  const getPlayerDisplayName = (player: Player) => {
    if (player.nickname && player.nickname.trim() !== '') {
      return player.nickname;
    }
    return player.userId;
  };

  // Handle battle start - navigate to discussion view
  const handleBattleStart = useCallback(() => {
    navigate('/discussion');
  }, [navigate]);

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

    const newSocket = io(
      process.env.NODE_ENV == 'production' ? serverUrl : 'http://localhost:3050'
    );
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      newSocket.emit('get_rooms', (data: { rooms: Room[] }) => {
        setRooms(data.rooms);
      });

      // Get subjects for room creation
      newSocket.emit(
        'get_subjects',
        (data: { subjects?: Subject[]; error?: string }) => {
          console.log('Received subjects data:', data);
          if (data.subjects) {
            console.log('Setting subjects:', data.subjects);
            setSubjects(data.subjects);
          } else if (data.error) {
            console.error('Error fetching subjects:', data.error);
          }
        }
      );
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

    return () => {
      newSocket.disconnect();
    };
  }, [handleBattleStart, userId]);

  const handleCreateRoom = () => {
    if (selectedSubject && socket && userId) {
      socket.emit(
        'create_room',
        { userId, subjectId: selectedSubject },
        (ack: { room?: Room; error?: string }) => {
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

  const handleJoinRoom = (roomId: string) => {
    if (socket && userId) {
      socket.emit(
        'join_room',
        { roomId, userId },
        (ack: { room?: Room; error?: string }) => {
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

  const handleLeaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave_room', { roomId: currentRoom.roomId, userId });
    }
    setIsRoomModalOpen(false);
    setCurrentRoom(null);
    setMyPosition(null);
  };

  const handleChangeSubject = () => {
    if (selectedSubject && socket && currentRoom) {
      socket.emit(
        'change_room_subject',
        { roomId: currentRoom.roomId, subjectId: selectedSubject },
        (ack: { success?: boolean; error?: string }) => {
          if (ack.success) {
            setIsChangeSubjectOpen(false);
          } else {
            alert(ack.error || '주제 변경에 실패했습니다.');
          }
        }
      );
    }
  };

  const handlePositionSelect = (position: 'agree' | 'disagree') => {
    // TODO: Deploy 시 삭제
    console.log(socket, currentRoom, userId, myPosition);

    if (!socket || !currentRoom || !userId) {
      return;
    }
    // 같은 입장을 다시 클릭하면 선택 취소
    if (myPosition === position) {
      socket.emit(
        'select_position',
        { roomId: currentRoom.roomId, userId, position: null },
        (ack: { success?: boolean; error?: string }) => {
          if (ack.success) {
            setMyPosition(null);
          } else {
            alert(ack.error || '입장 선택 취소에 실패했습니다.');
          }
        }
      );
    } else {
      socket.emit(
        'select_position',
        { roomId: currentRoom.roomId, userId, position },
        (ack: { success?: boolean; error?: string }) => {
          if (ack.success) {
            setMyPosition(position);
          } else {
            alert(ack.error || '입장 선택에 실패했습니다.');
          }
        }
      );
    }
  };

  const handleReady = () => {
    if (socket && currentRoom && userId && myPosition) {
      socket.emit('player_ready', { roomId: currentRoom.roomId, userId });
    }
  };

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
