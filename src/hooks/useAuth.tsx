import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  whatsapp: string | null;
  email: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string, whatsapp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  needsWhatsApp: boolean;
  setNeedsWhatsApp: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsWhatsApp, setNeedsWhatsApp] = useState(false);

  const fetchProfile = async (userId: string) => {
    // Query by id (which is the user's auth id)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      // Check if user needs to complete WhatsApp
      if (!data.whatsapp) {
        setNeedsWhatsApp(true);
      }
    } else if (!data) {
      // Profile doesn't exist, create one (fallback for edge cases)
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { error: insertError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: userData.user.user_metadata?.full_name || '',
          whatsapp: userData.user.user_metadata?.whatsapp || '',
          email: userData.user.email || '',
        });
        if (!insertError) {
          // Fetch again after insert
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (newProfile) {
            setProfile(newProfile);
          }
        }
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer profile fetch with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setNeedsWhatsApp(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error: error as Error | null };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, whatsapp: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          whatsapp, // Saved to metadata; server trigger creates profile row
        }
      }
    });

    // Profile is created automatically by database trigger (on_auth_user_created)
    // WhatsApp is stored in user_metadata and will be synced by fetchProfile fallback

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setNeedsWhatsApp(false);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('Tidak ada user yang login') };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      updateProfile,
      refreshProfile,
      needsWhatsApp,
      setNeedsWhatsApp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
