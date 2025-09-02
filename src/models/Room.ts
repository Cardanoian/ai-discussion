export interface Player {
  socketId: string;
  userId: string;
  nickname?: string;
  isReady: boolean;
  position?: 'agree' | 'disagree';
}

export interface Room {
  roomId: string;
  players: Player[];
  subject: { uuid: string; title: string; text: string } | null;
  isFull: boolean;
  battleStarted: boolean;
  createdBy?: string;
}

export interface Subject {
  uuid: string;
  title: string;
  text: string;
}
