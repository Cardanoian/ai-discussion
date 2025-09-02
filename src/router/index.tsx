import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeView from '@/views/WelcomeView';
import MainView from '@/views/MainView';
import DocsView from '@/views/DocsView';
import DiscussionView from '@/views/DiscussionView';
import WaitingRoomView from '@/views/WaitingRoomView';
import ProfileView from '@/views/ProfileView';
import AuthGuard from '@/components/AuthGuard';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <WelcomeView />
      </AuthGuard>
    ),
  },
  {
    path: '/main',
    element: (
      <AuthGuard requireAuth>
        <MainView />
      </AuthGuard>
    ),
  },
  {
    path: '/docs',
    element: (
      <AuthGuard requireAuth>
        <DocsView />
      </AuthGuard>
    ),
  },
  {
    path: '/discussion',
    element: (
      <AuthGuard requireAuth>
        <DiscussionView />
      </AuthGuard>
    ),
  },
  {
    path: '/waiting-room',
    element: (
      <AuthGuard requireAuth>
        <WaitingRoomView />
      </AuthGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthGuard requireAuth>
        <ProfileView />
      </AuthGuard>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
