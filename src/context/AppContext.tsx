import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api, setAuthToken } from '../services/api';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface Toast { id: string; type: ToastType; msg: string }

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  headline?: string;
  about?: string;
  location?: string;
  phone?: string;
  profilePhoto?: string;
  visibility?: string;
  completionPercentage?: number;
  missingSections?: string[];
  skills?: Array<{ id: string; skill: { id: string; name: string }; yearsOfExperience?: number; rating?: number }>;
  education?: Array<{ id: string; institution: string; degree: string; fieldOfStudy: string; startDate: string; endDate?: string; description?: string }>;
  experience?: Array<{ id: string; company: string; title: string; location?: string; startDate: string; endDate?: string; currentlyWorking?: boolean; description?: string }>;
  projects?: Array<{ id: string; title: string; description: string; technologies?: string; projectUrl?: string; repositoryUrl?: string }>;
  resumes?: Array<{ id: string; title: string; fileUrl: string; fileName: string; isPrimary?: boolean }>;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  initials?: string;
  profilePhoto?: string;
  emailVerified?: boolean;
  isNewUser?: boolean;
  profile?: UserProfile;
}

// Auth views for the new OTP flow
export type AuthView = 'login' | null;

// Auth state machine
export type AuthState = 'initializing' | 'authenticated' | 'unauthenticated';

interface Ctx {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: string; setCurrency: (v: string) => void;
  language: string; setLanguage: (v: string) => void;
  toasts: Toast[]; addToast: (t: ToastType, m: string) => void; removeToast: (id: string) => void;
  cmdOpen: boolean; setCmdOpen: (v: boolean) => void;
  authView: AuthView; setAuthView: (v: AuthView) => void;
  authState: AuthState;
  user: User | null; setUser: (u: User | null) => void;
  profile: UserProfile | null;
  authLoading: boolean;
  // OTP auth methods
  sendOtp: (email: string) => Promise<{ success: boolean; resendAvailableAt?: Date }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  resendOtp: (email: string) => Promise<{ success: boolean; resendAvailableAt?: Date }>;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Legacy compatibility
  loginUser: (email: string, pass: string) => Promise<any>;
  registerUser: (name: string, email: string, pass: string, role?: string) => Promise<any>;
  updateProfileData: (data: any) => Promise<any>;
  addSkill: (name: string, years?: number, rating?: number) => Promise<any>;
  removeSkill: (id: string) => Promise<any>;
  addEducation: (data: any) => Promise<any>;
  deleteEducation: (id: string) => Promise<any>;
  addExperience: (data: any) => Promise<any>;
  deleteExperience: (id: string) => Promise<any>;
  addProject: (data: any) => Promise<any>;
  deleteProject: (id: string) => Promise<any>;
  uploadResume: (data: any) => Promise<any>;
  deleteResume: (id: string) => Promise<any>;
  favorites: string[]; toggleFav: (id: string) => void;
  savedCreators: string[]; toggleSaved: (id: string) => void;
  notifCount: number; setNotifCount: (n: number) => void;
}

const Ctx = createContext<Ctx | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedCreators, setSavedCreators] = useState<string[]>([]);
  const [notifCount, setNotifCount] = useState(3);

  const addToast = useCallback((type: ToastType, msg: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p.slice(-4), { id, type, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, []);

  // Initialize auth state on app startup
  useEffect(() => {
    async function initAuth() {
      try {
        // Try to restore session from secure HttpOnly cookie
        const res = await api.getCurrentUser();
        if (res.data?.user) {
          setUser(res.data.user);
          setAuthState('authenticated');
          await refreshProfile();
        } else {
          setAuthState('unauthenticated');
        }
      } catch {
        // No session or expired session
        setAuthToken(null);
        setAuthState('unauthenticated');
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, [refreshProfile]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const n = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', n);
      return n;
    });
  }, []);

  // ─── OTP auth methods ──────────────────────────────────────────
  const sendOtp = useCallback(async (email: string) => {
    const res = await api.requestOtp(email);
    return { success: res.data?.success ?? true };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await api.verifyOtp(email, otp);
    if (res.data?.authenticated && res.data?.user) {
      const userData = res.data.user;
      // Store token for Authorization header (backup for cookie-less envs)
      if (res.data.token) setAuthToken(res.data.token);
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        emailVerified: userData.emailVerified,
        isNewUser: userData.isNewUser,
      });
      setAuthState('authenticated');
      await refreshProfile();
      const displayName = userData.name || userData.email.split('@')[0];
      if (userData.isNewUser) {
        addToast('success', `Welcome to Project Content AI Marketplace, ${displayName}! 🎉`);
      } else {
        addToast('success', `Welcome back, ${displayName}!`);
      }
      setAuthView(null);
      return { success: true, isNewUser: userData.isNewUser };
    }
    return { success: false, isNewUser: false };
  }, [addToast, refreshProfile]);

  const resendOtp = useCallback(async (email: string) => {
    const res = await api.resendOtp(email);
    return { success: res.data?.success ?? true };
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    setAuthToken(null);
    setUser(null);
    setProfile(null);
    setAuthState('unauthenticated');
    addToast('info', 'Logged out successfully');
  }, [addToast]);

  // ─── Legacy compatibility ──────────────────────────────────────
  const loginUser = useCallback(async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setAuthState('authenticated');
      if (res.data.user.profile) {
        setProfile(res.data.user.profile);
      } else {
        await refreshProfile();
      }
      addToast('success', `Welcome back, ${res.data.user.name || 'User'}!`);
      setAuthView(null);
    }
    return res;
  }, [addToast, refreshProfile]);

  const registerUser = useCallback(async (name: string, email: string, pass: string, role = 'USER') => {
    const res = await api.register({ name, email, password: pass, role });
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setAuthState('authenticated');
      await refreshProfile();
      addToast('success', `Account created successfully! Welcome.`);
      setAuthView(null);
    }
    return res;
  }, [addToast, refreshProfile]);

  const updateProfileData = useCallback(async (data: any) => {
    const res = await api.updateProfile(data);
    if (res.data) setProfile(res.data);
    addToast('success', 'Profile updated!');
    return res;
  }, [addToast]);

  const addSkill = useCallback(async (name: string, years?: number, rating?: number) => {
    const res = await api.addSkill({ name, yearsOfExperience: years, rating });
    if (res.data) setProfile(res.data);
    addToast('success', `Added skill: ${name}`);
    return res;
  }, [addToast]);

  const removeSkill = useCallback(async (id: string) => {
    const res = await api.removeSkill(id);
    if (res.data) setProfile(res.data);
    addToast('info', 'Skill removed');
    return res;
  }, [addToast]);

  const addEducation = useCallback(async (data: any) => {
    const res = await api.addEducation(data);
    if (res.data) setProfile(res.data);
    addToast('success', 'Education entry added!');
    return res;
  }, [addToast]);

  const deleteEducation = useCallback(async (id: string) => {
    const res = await api.deleteEducation(id);
    if (res.data) setProfile(res.data);
    addToast('info', 'Education entry deleted');
    return res;
  }, [addToast]);

  const addExperience = useCallback(async (data: any) => {
    const res = await api.addExperience(data);
    if (res.data) setProfile(res.data);
    addToast('success', 'Experience entry added!');
    return res;
  }, [addToast]);

  const deleteExperience = useCallback(async (id: string) => {
    const res = await api.deleteExperience(id);
    if (res.data) setProfile(res.data);
    addToast('info', 'Experience entry deleted');
    return res;
  }, [addToast]);

  const addProject = useCallback(async (data: any) => {
    const res = await api.addProject(data);
    if (res.data) setProfile(res.data);
    addToast('success', 'Project added!');
    return res;
  }, [addToast]);

  const deleteProject = useCallback(async (id: string) => {
    const res = await api.deleteProject(id);
    if (res.data) setProfile(res.data);
    addToast('info', 'Project deleted');
    return res;
  }, [addToast]);

  const uploadResume = useCallback(async (data: any) => {
    const res = await api.uploadResume(data);
    if (res.data) setProfile(res.data);
    addToast('success', 'Resume uploaded!');
    return res;
  }, [addToast]);

  const deleteResume = useCallback(async (id: string) => {
    const res = await api.deleteResume(id);
    if (res.data) setProfile(res.data);
    addToast('info', 'Resume deleted');
    return res;
  }, [addToast]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSavedCreators((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }, []);

  return (
    <Ctx.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        language,
        setLanguage,
        toasts,
        addToast,
        removeToast,
        cmdOpen,
        setCmdOpen,
        authView,
        setAuthView,
        authState,
        user,
        setUser,
        profile,
        authLoading,
        sendOtp,
        verifyOtp,
        resendOtp,
        logoutUser,
        refreshProfile,
        loginUser,
        registerUser,
        updateProfileData,
        addSkill,
        removeSkill,
        addEducation,
        deleteEducation,
        addExperience,
        deleteExperience,
        addProject,
        deleteProject,
        uploadResume,
        deleteResume,
        favorites,
        toggleFav,
        savedCreators,
        toggleSaved,
        notifCount,
        setNotifCount,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
};
