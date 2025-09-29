export interface UserStats {
  rating: number;
  wins: number;
  loses: number;
  total_games: number;
  win_rate: number;
}

export interface UserProfile {
  user_uuid: string;
  display_name: string;
  avatar_url: string | null;
  rating: number;
  wins: number;
  loses: number;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

export interface RankInfo {
  title: string;
  color: string;
  textColor: string;
}
