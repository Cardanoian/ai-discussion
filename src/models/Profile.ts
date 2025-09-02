export interface UserStats {
  rating: number;
  wins: number;
  loses: number;
  total_games: number;
  win_rate: number;
}

export interface UserProfile {
  user_uuid: string;
  nickname: string | null;
  rating: number;
  wins: number;
  loses: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RankInfo {
  title: string;
  color: string;
  textColor: string;
}
