import AppRouter from './router';
import { ThemeProvider } from './contexts/ThemeProvider';
import { UserProfileProvider } from './contexts/UserProfileProvider';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <UserProfileProvider>
        <AppRouter />
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
