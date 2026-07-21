"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "TEACHER";
  imageUrl: string | null;
};

type SessionContextValue = {
  user: SessionUser | null;
  isLoaded: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoaded: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, isLoaded, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

/** Clerk-compatible shape: `const { userId, isSignedIn, isLoaded } = useAuth()` */
export function useAuth() {
  const { user, isLoaded } = useSession();
  return {
    userId: user?.id ?? null,
    isSignedIn: !!user,
    isLoaded,
  };
}

/** Clerk-compatible shape: `const { user, isSignedIn, isLoaded } = useUser()` */
export function useUser() {
  const { user, isLoaded } = useSession();
  return {
    user,
    isSignedIn: !!user,
    isLoaded,
  };
}
