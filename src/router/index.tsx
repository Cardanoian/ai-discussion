import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeView from '@/views/WelcomeView';
import MainView from '@/views/MainView';
import DocsView from '@/views/DocsView';
import DiscussionView from '@/views/DiscussionView';
import RoomListView from '@/views/RoomListView';
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
        <RoomListView />
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
