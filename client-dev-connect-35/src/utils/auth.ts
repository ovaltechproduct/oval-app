
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile, UserRole } from "@/types/auth";

// Simple in-memory cache for profiles
const profileCache = new Map<string, { profile: UserProfile; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds
const QUERY_TIMEOUT = 15000; // 15 seconds timeout for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay, will be doubled for each retry

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchUserProfile = async (authUser: User): Promise<UserProfile | null> => {
  try {
    console.log("[fetchUserProfile] Starting profile fetch for user:", authUser.id);
    
    if (!authUser.id) {
      console.error("[fetchUserProfile] No user ID provided");
      return null;
    }

    // Check cache first
    const cached = profileCache.get(authUser.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("[fetchUserProfile] Returning cached profile");
      return cached.profile;
    }

    // Get role from user metadata
    const userRole = authUser.user_metadata?.role as UserRole || "client";
    console.log("[fetchUserProfile] Role from metadata:", userRole);

    // Try to fetch profile with retries
    let existingProfile = null;
    let lastError = null;
    let retryCount = 0;
    let retryDelay = RETRY_DELAY;

    while (retryCount < MAX_RETRIES) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select()
          .eq("id", authUser.id)
          .maybeSingle();

        if (!error) {
          existingProfile = data;
          break;
        }

        lastError = error;
        console.log(`[fetchUserProfile] Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount < MAX_RETRIES) {
          await delay(retryDelay);
          retryDelay *= 2; // Exponential backoff
        }
      } catch (error) {
        lastError = error;
        break;
      }
    }

    if (lastError) {
      console.error("[fetchUserProfile] Error fetching profile after retries:", lastError);
      // Return temporary profile on error
      return {
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        email: authUser.email || '',
        role: userRole
      };
    }

    if (existingProfile) {
      console.log("[fetchUserProfile] Found existing profile:", existingProfile);
      const profile = {
        id: existingProfile.id,
        name: existingProfile.full_name,
        email: existingProfile.email,
        role: existingProfile.role as UserRole,
      };
      profileCache.set(authUser.id, { profile, timestamp: Date.now() });
      return profile;
    }

    // If no profile exists, try to create one with data from auth user
    console.log("[fetchUserProfile] No existing profile found, creating new profile");
    
    const profileData = {
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      role: userRole,
    };

    try {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single();

      if (insertError) {
        console.error("[fetchUserProfile] Profile creation error:", insertError);
        // Return temporary profile on error
        return {
          id: profileData.id,
          name: profileData.full_name,
          email: profileData.email,
          role: profileData.role
        };
      }

      console.log("[fetchUserProfile] Created new profile:", newProfile);
      const profile = {
        id: newProfile.id,
        name: newProfile.full_name,
        email: newProfile.email,
        role: newProfile.role as UserRole,
      };

      profileCache.set(authUser.id, { profile, timestamp: Date.now() });
      return profile;
    } catch (error) {
      // Handle any other errors during profile creation
      console.error("[fetchUserProfile] Unexpected error during profile creation:", error);
      return {
        id: profileData.id,
        name: profileData.full_name,
        email: profileData.email,
        role: profileData.role
      };
    }

  } catch (error) {
    console.error("[fetchUserProfile] Unexpected error:", error);
    // Return temporary profile on any error
    return {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      role: authUser.user_metadata?.role as UserRole || "client"
    };
  }
};

