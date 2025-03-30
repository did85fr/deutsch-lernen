import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authLogger } from '../lib/authLogger';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function useAuthDebug() {
  const logAuthState = useCallback(async () => {
    if (!import.meta.env.DEV) return;

    const tokenKey = 'sb-yofexqdswetgoscpwmjz-auth-token';
    const currentToken = localStorage.getItem(tokenKey);
    
    // Log token details
    authLogger.log('Debug: Token vérifié', { 
      hasToken: !!currentToken,
      tokenLength: currentToken?.length,
      tokenExpiry: currentToken ? JSON.parse(currentToken)?.expires_at : null
    });
    
    // Log session details
    try {
      const { data: { session } } = await supabase.auth.getSession();
      authLogger.log('Debug: Session vérifiée', { 
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        lastSignInAt: session?.user?.last_sign_in_at,
        expiresAt: session?.expires_at
      });
    } catch (error) {
      authLogger.log('Debug: Erreur lors de la vérification de session', { error });
    }
  }, []);

  const handleAuthChange = useCallback((event: AuthChangeEvent, session: Session | null) => {
    authLogger.log('Debug: Changement d\'état auth', { 
      event, 
      userId: session?.user?.id,
      timestamp: new Date().toISOString(),
      sessionExpiry: session?.expires_at
    });
    
    // Refresh auth state on important events
    if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
      logAuthState();
    }
  }, [logAuthState]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // Initial auth state check
    logAuthState();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
      authLogger.log('Debug: Nettoyage du hook useAuthDebug');
    };
  }, [logAuthState, handleAuthChange]);
}


