import { createContext } from 'react';
import { type ThemeProviderState } from './ThemeProvider';
import { initialThemeState } from './initialThemeState';

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialThemeState);
