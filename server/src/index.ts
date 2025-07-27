import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoomHandlers } from './socket/roomHandlers';
import { registerBattleHandlers } from './socket/battleHandlers';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, you should restrict this to your frontend's URL
    methods: ['GET', 'POST'],
  },
});

const onConnection = (socket: any) => {
  console.log(`New client connected: ${socket.id}`);
  
  registerRoomHandlers(io, socket);
  registerBattleHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Handle cleanup when a user disconnects, e.g., leave rooms
  });
};

io.on('connection', onConnection);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
