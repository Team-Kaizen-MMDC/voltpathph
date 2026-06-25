import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isAuthConfigured } from "./supabase";

interface AuthState {
  /** Current session, or null when signed out / auth disabled. */
  session: Session | null;
  /** True while the initial session is being restored. */
  loading: boolean;
  /** Whether sign-in is enforced (Supabase configured). */
  authEnabled: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error?: string; message?: string }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Only "loading" when we actually have a client to restore a session from.
  const [loading, setLoading] = useState(isAuthConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthState["signIn"] = async (email, password) => {
    if (!supabase) return {};
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message };
  };

  const signUp: AuthState["signUp"] = async (email, password) => {
    if (!supabase) return {};
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // When email confirmation is enabled, no session is returned yet.
    if (!data.session)
      return { message: "Check your email to confirm your account." };
    return {};
  };

  const signOut: AuthState["signOut"] = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        authEnabled: isAuthConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
