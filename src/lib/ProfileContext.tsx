"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getLevelInfo } from "@/lib/levels";

type Profile = {
  id: string;
  nombre: string;
  xp: number;
  racha: number;
  minutos_hoy: number;
};

type ProfileContextType = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  levelUp: { from: any; to: any } | null;
  clearLevelUp: () => void;
  addXp: (amount: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  loading: true,
  levelUp: null,
  clearLevelUp: () => {},
  addXp: async () => {},
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUp, setLevelUp] = useState<{ from: any; to: any } | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const addXp = useCallback(
    async (amount: number) => {
      if (!user || !profile) return;
      const newXp = profile.xp + amount;
      const before = getLevelInfo(profile.xp).current;
      const after = getLevelInfo(newXp).current;

      const { error } = await supabase
        .from("profiles")
        .update({ xp: newXp })
        .eq("id", user.id);

      if (!error) {
        setProfile({ ...profile, xp: newXp });
        if (after.n > before.n) {
          setLevelUp({ from: before, to: after });
        }
      }
    },
    [user, profile]
  );

  const clearLevelUp = useCallback(() => setLevelUp(null), []);

  return (
    <ProfileContext.Provider
      value={{ user, profile, loading, levelUp, clearLevelUp, addXp, refreshProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
