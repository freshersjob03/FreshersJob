import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import Navbar from '@/components/ui/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  // Pages that don't need the navbar
  const noNavbarPages = ['Landing', 'Onboarding'];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await api.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = await api.auth.me();
        setUser(userData);

        const profiles = await api.entities.UserProfile.filter({ created_by: userData.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }
    } catch (error) {
      console.log('Auth check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // perform provider sign‑out
    if (auth && auth.signOut) {
      try {
        await auth.signOut();
      } catch (err) {
        console.error('signOut failed', err);
      }
    }

    // clear local state
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);

    // send user to the authentication flow instead of staying on the same
    // page.  use the hook's navigateToLogin if available (Clerk will open its
    // hosted sign‑in page).  fallback to a hard redirect to the landing route.
    if (auth && auth.navigateToLogin) {
      auth.navigateToLogin();
    } else {
      window.location.href = createPageUrl('Landing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#3aafc4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Landing and Onboarding pages have their own layout
  if (noNavbarPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        profile={profile} 
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />
      <main className="pt-[74px]">
        {children}
      </main>
    </div>
  );
}
