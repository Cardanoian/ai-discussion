export interface Message {
  text: string;
  sender: 'agree' | 'disagree' | 'system' | 'judge';
}

export interface BattleResult {
  agree: {
    score: number;
    good: string;
    bad: string;
  };
  disagree: {
    score: number;
    good: string;
    bad: string;
  };
  winner: string;
}

export interface Room {
  roomId: string;
  subject: {
    uuid: string;
    title: string;
    text: string;
  } | null;
  players: Array<{
    socketId: string;
    userId: string;
    displayname: string;
    isReady: boolean;
    position?: 'agree' | 'disagree';
    rating: number;
    wins: number;
    loses: number;
  }>;
  isFull: boolean;
  battleStarted: boolean;
}
