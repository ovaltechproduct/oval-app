
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "@/utils/auth";
import { UserProfile } from "@/types/auth";
import { toast } from "@/hooks/use-toast";

// Adjusted timeouts based on logs
const SESSION_CHECK_TIMEOUT = 5000; // 5 seconds max for session check
const PROFILE_QUERY_TIMEOUT = 5000; // 5 seconds max for profile
const MIN_AUTH_CHECK_INTERVAL = 1000; // 1 second between auth checks

let lastAuthCheck = 0;

export const initializeAuthSession = async () => {
  try {
    const now = Date.now();
    if (now - lastAuthCheck < MIN_AUTH_CHECK_INTERVAL) {
      console.log("[initializeAuthSession] Throttling auth check");
      return null;
    }
    lastAuthCheck = now;

    console.log("[initializeAuthSession] Starting session initialization");
    
    // Define the type for the session response
    type SessionResponse = Awaited<ReturnType<typeof supabase.auth.getSession>>;
    
    // Add timeout for session check
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<SessionResponse>((_, reject) => 
      setTimeout(() => reject(new Error("Session check timeout")), SESSION_CHECK_TIMEOUT)
    );

    const sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
    
    const session = sessionResult.data.session;

    console.log("[initializeAuthSession] Session retrieved:", {
      hasSession: !!session,
      userId: session?.user?.id
    });

    return session;
  } catch (error) {
    console.error("[initializeAuthSession] Error:", error);
    toast({
      title: "Session Error",
      description: "There was a problem checking your session. Please try logging in again.",
      variant: "destructive",
    });
    return null;
  }
};

export const handleAuthStateChange = async (
  session: Session | null,
  setUser: (user: UserProfile | null) => void,
  setSession: (session: Session | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  console.log("[handleAuthStateChange] Processing auth state change:", {
    hasSession: !!session,
    userId: session?.user?.id
  });

  try {
    if (!session?.user) {
      console.log("[handleAuthStateChange] No valid session, clearing state");
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setSession(session);
    
    // Add timeout for profile fetch
    const profilePromise = fetchUserProfile(session.user);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Profile fetch timeout")), PROFILE_QUERY_TIMEOUT)
    );

    try {
      console.log("[handleAuthStateChange] Fetching user profile");
      const userProfile = await Promise.race([profilePromise, timeoutPromise]);

      if (!userProfile) {
        throw new Error("Failed to fetch user profile");
      }

      console.log("[handleAuthStateChange] Profile fetched:", {
        userId: userProfile.id,
        role: userProfile.role
      });

      setUser(userProfile);
    } catch (error) {
      console.error("[handleAuthStateChange] Profile error:", error);
      setUser(null);
      toast({
        title: "Profile Error",
        description: "Failed to load your profile. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("[handleAuthStateChange] Fatal error:", error);
    setSession(null);
    setUser(null);
    toast({
      title: "Authentication Error",
      description: "There was a problem with your session. Please try logging in again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
