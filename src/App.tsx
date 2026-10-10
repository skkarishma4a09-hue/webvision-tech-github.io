import React from 'react';

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import CommandMenu from './components/CommandMenu';
import AuthModal from './components/AuthModal';

// Pages
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

function AppShell() {
  return <RouterProvider router={router} />;
}

export function FooterWrapper() {
  const path = window.location.pathname;
  if (['/ai-studio', '/chat'].includes(path)) return null;
  return <Footer />;
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
