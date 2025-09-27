export interface Player {
  socketId: string;
  userId: string;
  displayname: string;
  isReady: boolean;
  position?: 'agree' | 'disagree';
  role: 'player' | 'spectator' | 'referee';
  rating: number;
  wins: number;
  loses: number;
}

export interface Room {
  roomId: string;
  players: Player[];
  subject: { uuid: string; title: string; text: string } | null;
  isFull: boolean;
  battleStarted: boolean;
  createdBy?: string;
  hasReferee: boolean;
}

export interface Subject {
  uuid: string;
  title: string;
  text: string;
}
