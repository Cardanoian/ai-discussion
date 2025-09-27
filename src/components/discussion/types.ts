import type { Message } from '@/models/Discussion';
import type { Socket } from 'socket.io-client';

export interface TimerInfo {
  myPenaltyPoints: number;
  opponentPenaltyPoints: number;
  maxPenaltyPoints: number;
}

export interface TimerState {
  isRunning: boolean;
  roundTimeRemaining: number;
  totalTimeRemaining: number;
  isOvertime: boolean;
  overtimeRemaining: number;
}

export interface RefereeScoreData {
  agreePlayerName: string;
  disagreePlayerName: string;
}

export interface BaseDiscussionProps {
  messages: Message[];
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  battleEnded: boolean;
  userRole: 'player' | 'spectator' | 'referee';
}

export interface PlayerViewProps extends BaseDiscussionProps {
  isMyTurn: boolean;
  sendMessage: (message: string) => void;
  requestAiHelp?: () => Promise<string | null>;
  isRequestingAiHelp: boolean;
  userPosition: 'agree' | 'disagree' | null;
}

export interface RefereeViewProps extends BaseDiscussionProps {
  socket: Socket | null;
  roomId: string | null;
  userId: string | null;
  isRefereeScoreModalOpen: boolean;
  setIsRefereeScoreModalOpen: (open: boolean) => void;
  refereeScoreData: RefereeScoreData | null;
  handleRefereeScoreSubmit: (scores: {
    agree: number;
    disagree: number;
  }) => void;
}

export interface HeaderProps {
  isMyTurn: boolean;
  battleEnded: boolean;
  timerInfo: TimerInfo;
  timerState: TimerState;
  formatTime: (seconds: number) => string;
}

export interface MessageRendererProps {
  message: Message;
  index: number;
  userRole: 'player' | 'spectator' | 'referee';
  currentUserPosition?: 'agree' | 'disagree';
}
