
import { useState, useCallback, useRef, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/auth";

export const useAuthState = () => {
  const [state, setState] = useState<{
    user: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
  }>({
    user: null,
    session: null,
    isLoading: true
  });

  const stateRef = useRef(state);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  stateRef.current = state;

  const setUser = useCallback((newUser: UserProfile | null) => {
    if (!mountedRef.current) return;
    console.log("[useAuthState] Setting user:", { userId: newUser?.id, role: newUser?.role });
    setState(prev => {
      // Prevent unnecessary updates
      if (prev.user?.id === newUser?.id && prev.user?.role === newUser?.role) {
        return prev;
      }
      return { ...prev, user: newUser };
    });
  }, []);

  const setSession = useCallback((newSession: Session | null) => {
    if (!mountedRef.current) return;
    console.log("[useAuthState] Setting session:", { sessionId: newSession?.user?.id });
    setState(prev => {
      // Prevent unnecessary updates
      if (prev.session?.user?.id === newSession?.user?.id) {
        return prev;
      }
      return { ...prev, session: newSession };
    });
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    if (!mountedRef.current) return;
    console.log("[useAuthState] Setting loading state:", loading);
    setState(prev => {
      // Prevent unnecessary updates
      if (prev.isLoading === loading) {
        return prev;
      }
      return { ...prev, isLoading: loading };
    });
  }, []);

  const setAuthState = useCallback((
    newUser: UserProfile | null,
    newSession: Session | null,
    loading: boolean
  ) => {
    if (!mountedRef.current) return;
    console.log("[useAuthState] Updating auth state:", { 
      hasUser: !!newUser, 
      hasSession: !!newSession, 
      loading
    });

    setState(prev => {
      // Prevent unnecessary updates
      if (
        prev.user?.id === newUser?.id &&
        prev.session?.user?.id === newSession?.user?.id &&
        prev.isLoading === loading
      ) {
        return prev;
      }
      return {
        user: newUser,
        session: newSession,
        isLoading: loading
      };
    });
  }, []);

  const resetAuthState = useCallback(() => {
    if (!mountedRef.current) return;
    console.log("[useAuthState] Resetting auth state");
    setState(prev => {
      // Only reset if there's actually state to reset
      if (!prev.user && !prev.session && !prev.isLoading) {
        return prev;
      }
      return {
        user: null,
        session: null,
        isLoading: false
      };
    });
  }, []);

  return {
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    setUser,
    setSession,
    setIsLoading,
    setAuthState,
    resetAuthState,
  };
};
