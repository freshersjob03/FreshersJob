// Authentication context and application parameters placeholder.
// The previous Base44-specific logic has been removed; this module now
// provides a thin wrapper around Clerk (or whatever provider you choose).
//
// 1. Create a Clerk project and set VITE_CLERK_PUBLISHABLE_KEY in your
//    local/.env and in production.  The secret key is used on the server
//    (not shown here).
// 2. Wrap your app with <AuthProvider> in `src/main.jsx` (already done).
// 3. Use `useAuth()` in pages/components to query authentication state,
//    redirect, obtain tokens, etc.  The hook is intentionally small so you
//    can swap in another provider (Supabase, custom JWT) by editing this
//    file and `api/apiClient.js`.

import React, { createContext, useContext } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

// application parameters (was used by Base44 previously)
export const appParams = {};

const AuthContext = createContext(null);

function InternalAuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();

  const navigateToLogin = (url) => {
    clerk.openSignIn({ redirectUrl: url });
  };

  const signOut = () => clerk.signOut();
  const getToken = async () => {
    if (!clerk || !isSignedIn) return null;
    return clerk.getToken({ template: 'default' });
  };

  const value = {
    isLoaded,
    isSignedIn,
    user,
    clerk,
    navigateToLogin,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={clerkPubKey || ''}>
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </ClerkProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }

  return {
    isLoadingAuth: !ctx.isLoaded,
    isLoadingPublicSettings: false,
    authError: null,

    // helpers
    navigateToLogin: ctx.navigateToLogin,
    isAuthenticated: ctx.isSignedIn,
    user: ctx.user,
    signOut: ctx.signOut,
    getToken: ctx.getToken,
    clerk: ctx.clerk, // expose raw clerk if you need extra features
  };
}

