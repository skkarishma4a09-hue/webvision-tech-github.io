import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CommandMenu from '../components/CommandMenu';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';
import Footer from '../components/Footer';

export default function RootLayout() {
  const location = useLocation();
  const hideFooter = ['/ai-studio', '/chat'].includes(location.pathname);
  return (
    <>
      <Navbar />
      <CommandMenu />
      <AuthModal />
      <Toast />
      <Outlet />
      {!hideFooter && <Footer />}
    </>
  );
}
