import { Server, Socket } from 'socket.io';
import { BattleRoom, Subject } from '../types/database';
import { supabase } from '../supabaseClient';

const rooms: BattleRoom[] = [];

const createRoom = (roomId: string, subject: Subject): BattleRoom => ({
  roomId,
  subject,
  players: [],
  isFull: false,
  battleStarted: false,
});

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on('get_subjects', async (callback) => {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) {
      console.error('Error fetching subjects:', error);
      callback({ error: 'Failed to fetch subjects' });
      return;
    }
    callback({ subjects: data });
  });

  socket.on(
    'create_room',
    (
      { userId, subjectId }: { userId: string; subjectId: string },
      callback
    ) => {
      const roomId = `room_${new Date().getTime()}`;

      supabase
        .from('subjects')
        .select('*')
        .eq('uuid', subjectId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            callback({ error: 'Subject not found' });
            return;
          }
          const newRoom = createRoom(roomId, data);
          newRoom.players.push({ socketId: socket.id, userId, isReady: false });
          rooms.push(newRoom);
          socket.join(roomId);
          callback({ room: newRoom });
          io.emit(
            'rooms_update',
            rooms.filter((r) => !r.isFull && !r.battleStarted)
          );
        });
    }
  );

  socket.on(
    'join_room',
    ({ roomId, userId }: { roomId: string; userId: string }, callback) => {
      const room = rooms.find((r) => r.roomId === roomId);
      if (room && !room.isFull) {
        room.players.push({ socketId: socket.id, userId, isReady: false });
        socket.join(roomId);
        if (room.players.length === 2) {
          room.isFull = true;
        }
        callback({ room });
        io.to(roomId).emit('room_update', room);
        io.emit(
          'rooms_update',
          rooms.filter((r) => !r.isFull && !r.battleStarted)
        );
      } else {
        callback({ error: 'Room not found or is full' });
      }
    }
  );

  socket.on('get_rooms', (callback) => {
    callback({ rooms: rooms.filter((r) => !r.isFull && !r.battleStarted) });
  });

  socket.on(
    'player_ready',
    ({ roomId, userId }: { roomId: string; userId: string }) => {
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        const player = room.players.find((p) => p.userId === userId);
        if (player) {
          player.isReady = !player.isReady;
          io.to(roomId).emit('room_update', room);

          if (
            room.players.length === 2 &&
            room.players.every((p) => p.isReady)
          ) {
            room.battleStarted = true;
            io.to(roomId).emit('battle_start', room);
            io.emit(
              'rooms_update',
              rooms.filter((r) => !r.isFull && !r.battleStarted)
            );
          }
        }
      }
    }
  );

  socket.on(
    'leave_room',
    ({ roomId, userId }: { roomId: string; userId: string }) => {
      const roomIndex = rooms.findIndex((r) => r.roomId === roomId);
      if (roomIndex !== -1) {
        const room = rooms[roomIndex];
        room.players = room.players.filter((p) => p.userId !== userId);
        socket.leave(roomId);

        if (room.players.length === 0) {
          rooms.splice(roomIndex, 1);
        } else {
          room.isFull = false;
          room.players.forEach((p) => (p.isReady = false));
          io.to(roomId).emit('room_update', room);
        }
        io.emit(
          'rooms_update',
          rooms.filter((r) => !r.isFull && !r.battleStarted)
        );
      }
    }
  );
};
