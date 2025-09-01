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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import io, { Socket } from 'socket.io-client';
import { Check, LogIn, Plus, Users, Hourglass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';

// These types should ideally be in a shared file
interface Player {
  socketId: string;
  userId: string;
  isReady: boolean;
}

interface Room {
  roomId: string;
  players: Player[];
  subject: { uuid: string; title: string } | null;
  isFull: boolean;
  battleStarted: boolean;
}

interface Subject {
  uuid: string;
  title: string;
  text: string;
}

const serverUrl = import.meta.env.VITE_SERVER_URL;

const WaitingRoomView = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');

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
      // process.env.NODE_ENV === 'production' ? window.location.origin : "http://localhost:3050"
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
    if (selectedSubject && socket && userId) {
      socket.emit(
        'create_room',
        { userId, subjectId: selectedSubject },
        (ack: { room?: Room; error?: string }) => {
          if (ack.room) {
            setCurrentRoom(ack.room);
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
          if (ack.room) setCurrentRoom(ack.room);
          else alert(ack.error);
        }
      );
    }
  };

  const handleReady = () => {
    if (socket && currentRoom && userId) {
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
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' className='w-full'>
                  <Plus className='w-4 h-4 mr-2' />방 만들기
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>새 토론방 만들기</DialogTitle>
                  <DialogDescription>
                    토론할 주제를 선택해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='subject' className='text-right'>
                      주제
                    </Label>
                    <div className='col-span-3'>
                      <Select
                        value={selectedSubject}
                        onValueChange={setSelectedSubject}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='주제를 선택하세요' />
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
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type='submit'
                    onClick={handleCreateRoom}
                    disabled={!selectedSubject}
                  >
                    방 만들기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {currentRoom && (
              <Button
                onClick={handleReady}
                disabled={me?.isReady}
                className='w-full'
              >
                <Check className='w-4 h-4 mr-2' />
                준비 완료
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingRoomView;
