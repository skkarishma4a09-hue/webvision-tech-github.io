import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import Analytics from './pages/Analytics';
import AIStudio from './pages/AIStudio';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // layout provides navbar etc.
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: <Explore /> },
      { path: '/creators', element: <Creators /> },
      { path: '/creator/:id', element: <CreatorProfile /> },
      { path: '/services', element: <Services /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/creator-dashboard', element: <CreatorDashboard /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/ai-studio', element: <AIStudio /> },
      { path: '/chat', element: <Chat /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '*', element: <Home /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});
