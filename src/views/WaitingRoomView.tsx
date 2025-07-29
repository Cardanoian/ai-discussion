import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import io, { Socket } from 'socket.io-client';
import { Check, LogIn, Plus, Users, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// These types should ideally be in a shared file
interface Player {
  socketId: string;
  userId: string;
  isReady: boolean;
}

interface Room {
  roomId: string;
  players: Player[];
  subject: { title: string } | null;
  isFull: boolean;
  battleStarted: boolean;
}

const WaitingRoomView = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  useEffect(() => {
    const newSocket = io(
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001'
    );
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      newSocket.emit('get_rooms', (data: { rooms: Room[] }) => {
        setRooms(data.rooms);
      });
    });

    newSocket.on('rooms_update', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);
    });

    newSocket.on('room_update', (updatedRoom: Room) => {
      setCurrentRoom(updatedRoom);
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          r.roomId === updatedRoom.roomId ? updatedRoom : r
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    // In a real app, this would use a modal with a subject selector
    const subjectId = prompt('Enter subject ID to create a room:');
    if (subjectId && socket) {
      // We need the user's ID here. For now, it's mocked.
      const userId = 'mock_user_id';
      socket.emit(
        'create_room',
        { userId, subjectId },
        (ack: { room?: Room; error?: string }) => {
          if (ack.room) setCurrentRoom(ack.room);
          else alert(ack.error);
        }
      );
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (socket) {
      const userId = 'mock_user_id'; // Mocked user ID
      socket.emit(
        'join_room',
        { roomId, userId },
        (ack: { room?: Room; error?: string }) => {
          if (ack.room) setCurrentRoom(ack.room);
          else alert(ack.error);
        }
      );
    }
  };

  const handleReady = () => {
    if (socket && currentRoom) {
      const userId = 'mock_user_id'; // Mocked user ID
      socket.emit('player_ready', { roomId: currentRoom.roomId, userId });
    }
  };

  const me = currentRoom?.players.find((p) => p.socketId === socket?.id);

  return (
    <div className='flex flex-col md:flex-row h-screen p-4 md:p-8 gap-8'>
      {/* Left Panel: Room List */}
      <Card className='md:w-2/3 w-full flex flex-col animate-in fade-in-50 duration-500'>
        <CardHeader>
          <CardTitle className='text-2xl'>대전 목록</CardTitle>
          <CardDescription>
            참여할 방을 선택하거나 새로운 방을 만드세요.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-grow'>
          <ScrollArea className='h-[calc(100vh-18rem)] pr-4'>
            <div className='space-y-4'>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <Card
                    key={room.roomId}
                    className='flex justify-between items-center p-4 transition-all hover:border-primary/80'
                  >
                    <div>
                      <p className='font-bold text-lg'>
                        {room.subject?.title || 'Unknown Subject'}
                      </p>
                      <div className='text-sm text-muted-foreground flex items-center mt-1'>
                        <Users className='w-4 h-4 mr-2' />
                        <span>{room.players.length}/2 Players</span>
                      </div>
                    </div>
                    <Button
                      variant='secondary'
                      onClick={() => handleJoinRoom(room.roomId)}
                      disabled={room.isFull}
                    >
                      <LogIn className='w-4 h-4 mr-2' />
                      참여
                    </Button>
                  </Card>
                ))
              ) : (
                <div className='text-center text-muted-foreground py-16'>
                  <Hourglass className='w-8 h-8 mx-auto mb-4' />
                  <p>현재 참여 가능한 방이 없습니다.</p>
                  <p>새로운 방을 만들어보세요!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel: Current Room Info */}
      <Card className='md:w-1/3 w-full flex flex-col animate-in fade-in-50 duration-500'>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {currentRoom ? '대전방 정보' : '대기중'}
          </CardTitle>
          <CardDescription>
            {currentRoom
              ? '모든 플레이어가 준비되면 대전이 시작됩니다.'
              : '방에 참여하거나 새로 만들어주세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-grow flex flex-col justify-between'>
          {currentRoom ? (
            <div className='space-y-4'>
              <h3 className='font-bold text-primary'>
                {currentRoom.subject?.title}
              </h3>
              <div className='space-y-2'>
                {currentRoom.players.map((player) => (
                  <div
                    key={player.socketId}
                    className='flex items-center justify-between p-3 bg-muted rounded-lg'
                  >
                    <span className='truncate'>{player.userId}</span>
                    <Badge variant={player.isReady ? 'default' : 'secondary'}>
                      {player.isReady ? '준비 완료' : '대기중'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex-grow flex items-center justify-center text-muted-foreground'>
              <p>방에 참여해주세요.</p>
            </div>
          )}
          <div className='mt-6 flex flex-col sm:flex-row gap-2'>
            <Button
              onClick={handleCreateRoom}
              variant='outline'
              className='w-full'
            >
              <Plus className='w-4 h-4 mr-2' />방 만들기
            </Button>
            <Button
              onClick={handleReady}
              disabled={!currentRoom || me?.isReady}
              className='w-full'
            >
              <Check className='w-4 h-4 mr-2' />
              준비 완료
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingRoomView;
