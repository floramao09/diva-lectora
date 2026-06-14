"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useProfile } from "@/lib/ProfileContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, levelUp, clearLevelUp } = useProfile();
  const pathname = usePathname();

  const hideNav = pathname?.startsWith("/lector") || pathname === "/login";

  // Mientras carga la sesión, mostrar pantalla simple
  if (loading) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="font-display text-ink text-lg">Cargando Diva Lectora... 🌸</p>
      </div>
    );
  }

  // Si no hay sesión y no está en login, el propio page.tsx de cada
  // ruta redirige a /login (ver ejemplo en src/app/page.tsx)

  return (
    <div className="app-shell relative">
      <div className="flex-1 overflow-y-auto relative">{children}</div>

      {levelUp && (
        <div
          className="absolute inset-0 bg-ink/45 flex items-center justify-center z-50"
          onClick={clearLevelUp}
        >
          <div className="bg-white rounded-3xl p-8 text-center max-w-[280px] shadow-2xl">
            <div className="text-5xl">🎉</div>
            <p className="text-sm text-inkSoft mt-2">¡Subiste de nivel!</p>
            <div className="w-[70px] h-[70px] rounded-full mx-auto my-3 bg-gradient-to-br from-lavender to-pink flex items-center justify-center text-4xl">
              {levelUp.to.animal}
            </div>
            <p className="text-xs text-inkSoft m-0">Nivel {levelUp.to.n}</p>
            <p className="font-display font-extrabold text-xl text-ink mt-0.5 mb-4">
              {levelUp.to.title}
            </p>
            <button
              onClick={clearLevelUp}
              className="border-none bg-lavender text-white font-extrabold text-sm px-7 py-3 rounded-full"
            >
              ¡Genial! ✨
            </button>
          </div>
        </div>
      )}

      {!hideNav && <BottomNav />}
    </div>
  );
}
