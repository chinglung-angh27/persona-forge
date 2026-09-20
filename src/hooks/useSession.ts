import { useState, useEffect } from 'react';
import { UserSession } from '../types';
import { INITIAL_SESSION } from '../data/initialData';

const SESSION_KEY = 'pf_session';

export function useSession() {
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isAuthenticated: Boolean(parsed.email) };
    }
    return INITIAL_SESSION;
  });

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const handleLogin = (email: string) => {
    setSession((prev) => ({ ...prev, email, isAuthenticated: true }));
  };

  const handleLogout = () => {
    setSession((prev) => ({ ...prev, isAuthenticated: false }));
  };

  const handleUpdateSession = (updated: Partial<UserSession>) => {
    setSession((prev) => ({ ...prev, ...updated }));
  };

  return { session, handleLogin, handleLogout, handleUpdateSession };
}