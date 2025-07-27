import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomeView from '@/views/WelcomeView';
import MainView from '@/views/MainView';
import DocsView from '@/views/DocsView';
import DiscussionView from '@/views/DiscussionView';
import WaitingRoomView from '@/views/WaitingRoomView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomeView />,
  },
  {
    path: '/main',
    element: <MainView />,
  },
  {
    path: '/docs',
    element: <DocsView />,
  },
  {
    path: '/discussion',
    element: <DiscussionView />,
  },
  {
    path: '/waiting-room',
    element: <WaitingRoomView />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
