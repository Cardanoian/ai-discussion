// 사용자 관련 타입 정의

export interface UserProfile {
  user_uuid: string;
  display_name: string;
  rating: number;
  wins: number;
  loses: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  rating: number;
  wins: number;
  loses: number;
  total_games: number;
  win_rate: number;
}

// 플레이어 관련 타입 (소켓 통신용)
export interface Player {
  socketId: string;
  userId: string;
  displayname: string;
  isReady: boolean;
  position?: 'agree' | 'disagree';
}

// 표시명을 위한 헬퍼 함수
export const getDisplayName = (userProfile: UserProfile | null): string => {
  return userProfile?.display_name ?? '';
};

export const getPlayerDisplayName = (player: Player): string => {
  return player.displayname;
};
