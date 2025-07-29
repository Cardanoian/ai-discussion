import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from 'react-router-dom';
import WelcomeView from '@/views/WelcomeView';
import MainView from '@/views/MainView';
import DocsView from '@/views/DocsView';
import DiscussionView from '@/views/DiscussionView';
import WaitingRoomView from '@/views/WaitingRoomView';
import { supabase } from '@/lib/supabaseClient'; // supabase 클라이언트 가져오기

const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomeView />,
    loader: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        return redirect('/main');
      }
      return null; // 세션이 없으면 WelcomeView 렌더링
    },
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
