import { createContext } from 'react';
import type { UserProfileContextType } from './UserProfileProvider';

export const UserProfileContext = createContext<
  UserProfileContextType | undefined
>(undefined);
