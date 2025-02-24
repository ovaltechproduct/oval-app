import React, { createContext, useContext, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AuthContextType, UserRole } from "@/types/auth";
import { useAuthState } from "@/hooks/useAuthState";
import { initializeAuthSession, handleAuthStateChange } from "@/utils/authHelpers";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    session, 
    isLoading, 
    setUser, 
    setSession, 
    setIsLoading,
    setAuthState, 
    resetAuthState 
  } = useAuthState();
  
  const mountedRef = useRef(false);
  const initializingRef = useRef(false);
  const authChangeSubscriptionRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        console.warn("[AuthProvider] Force-stopping loading state after timeout");
        setIsLoading(false);
        resetAuthState();
      }
    }, 10000); // 10 second safety timeout

    const initialize = async () => {
      if (!mountedRef.current || initializingRef.current) return;
      
      try {
        initializingRef.current = true;
        setIsLoading(true);
        console.log("[AuthProvider] Starting initialization");
        
        const initialSession = await initializeAuthSession();
        if (!mountedRef.current) return;

        if (initialSession) {
          console.log("[AuthProvider] Initial session found, handling auth state");
          await handleAuthStateChange(initialSession, setUser, setSession, setIsLoading);
        } else {
          console.log("[AuthProvider] No initial session found");
          resetAuthState();
        }
      } catch (error) {
        console.error("[AuthProvider] Initialization error:", error);
        if (mountedRef.current) {
          resetAuthState();
          toast({
            title: "Error",
            description: "Failed to initialize authentication. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (mountedRef.current) {
          initializingRef.current = false;
          setIsLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      if (authChangeSubscriptionRef.current) return;

      console.log("[AuthProvider] Setting up auth state change listener");
      authChangeSubscriptionRef.current = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("[AuthProvider] Auth state changed:", { event, userId: session?.user?.id });
        
        if (!mountedRef.current) {
          console.log("[AuthProvider] Skipping auth change - component unmounted");
          return;
        }

        try {
          setIsLoading(true);
          if (event === 'SIGNED_OUT' || !session) {
            console.log("[AuthProvider] User signed out or no session");
            resetAuthState();
          } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
            console.log("[AuthProvider] Valid session detected, updating state");
            await handleAuthStateChange(session, setUser, setSession, setIsLoading);
          }
        } catch (error) {
          console.error("[AuthProvider] Auth state change error:", error);
          if (mountedRef.current) {
            resetAuthState();
            toast({
              title: "Authentication Error",
              description: "There was an error with your session. Please try logging in again.",
              variant: "destructive",
            });
          }
        } finally {
          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      });
    };

    setupAuthListener();
    initialize();

    return () => {
      console.log("[AuthProvider] Cleanup - unsubscribing and clearing mounted flag");
      clearTimeout(safetyTimeout);
      mountedRef.current = false;
      if (authChangeSubscriptionRef.current?.data?.subscription) {
        authChangeSubscriptionRef.current.data.subscription.unsubscribe();
        authChangeSubscriptionRef.current = null;
      }
    };
  }, [setAuthState, resetAuthState, setUser, setSession, setIsLoading, isLoading]);

  const login = async (email: string, password: string) => {
    if (isLoading) return;
    
    try {
      console.log("[AuthProvider] Attempting login");
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error("[AuthProvider] Login error:", error);
      setIsLoading(false);
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    if (isLoading) return;
    
    try {
      console.log("[AuthProvider] Attempting signup");
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Please check your email to verify your account",
      });
    } catch (error: any) {
      console.error("[AuthProvider] Signup error:", error);
      setIsLoading(false);
      toast({
        title: "Signup Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    if (isLoading) return;
    
    try {
      console.log("[AuthProvider] Attempting logout");
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      resetAuthState();
    } catch (error: any) {
      console.error("[AuthProvider] Logout error:", error);
      setIsLoading(false);
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
