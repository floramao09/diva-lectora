"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Pill, EmptyState } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";

const BADGES = ["🥇", "🎖️", "🏅", "🌟", "💫", "🎀"];
const AUTHOR_CARDS = ["Virginia Woolf", "Simone de Beauvoir", "Audre Lorde", "Jane Austen", "bell hooks", "Simone Weil"];

export default function LogrosPage() {
  const router = useRouter();
  const { user, loading } = useProfile();
  const [tab, setTab] = useState("Insignias");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Logros y colecciones" emoji="🏅" subtitle="Tu álbum coleccionable irá creciendo con cada paso." />

      <div className="flex gap-2 mt-3.5 overflow-x-auto">
        {["Insignias", "Cartas de autoras", "Marcos", "Mascotas"].map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>
        ))}
      </div>

      {tab === "Insignias" && (
        <div className="grid grid-cols-3 gap-2.5 mt-3.5">
          {BADGES.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl py-5 px-2 text-center shadow-[0_4px_14px_-8px_rgba(150,120,180,0.25)]">
              <div className="w-12 h-12 rounded-full bg-lavenderSoft mx-auto flex items-center justify-center opacity-40">
                🔒
              </div>
              <p className="text-[11px] text-inkSoft mt-2.5 mb-0">Bloqueada</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Cartas de autoras" && (
        <div className="grid grid-cols-3 gap-2.5 mt-3.5">
          {AUTHOR_CARDS.map((a, i) => (
            <div key={i} className="bg-lavenderSoft rounded-xl py-4 px-1.5 text-center aspect-[3/4] flex flex-col items-center justify-center">
              <span className="opacity-60">🔒</span>
              <p className="text-[10.5px] text-inkSoft mt-2.5 mb-0 font-bold text-center">{a}</p>
            </div>
          ))}
        </div>
      )}

      {(tab === "Marcos" || tab === "Mascotas") && (
        <div className="mt-3.5">
          <EmptyState
            emoji={tab === "Marcos" ? "🖼️" : "🐾"}
            title={tab === "Marcos" ? "Sin marcos de perfil aún" : "Sin mascotas lectoras aún"}
            text="Completa retos y sube de nivel para desbloquear nuevos elementos de colección."
          />
        </div>
      )}

      <div className="mt-[18px] bg-gradient-to-br from-peachSoft to-pinkSoft rounded-2xl p-4 text-center">
        <p className="font-display font-bold text-sm text-ink m-0">
          ✨ 0 de {BADGES.length + AUTHOR_CARDS.length} elementos coleccionados
        </p>
      </div>
    </div>
  );
}
