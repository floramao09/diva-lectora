"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Pill, PageHeader, ProgressBar } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";

const AUTHORS = [
  { name: "Audre Lorde", emoji: "🌹", color: "bg-pinkSoft", requirements: ["Leer 100 páginas", "Guardar 10 citas", "Crear 3 notas", "Abrir 3 chats IA"] },
  { name: "bell hooks", emoji: "📚", color: "bg-skySoft", requirements: ["Leer 120 páginas", "Guardar 10 citas", "Crear 5 notas", "180 min leídos"] },
  { name: "Virginia Woolf", emoji: "🕊️", color: "bg-lavenderSoft", requirements: ["Leer 100 páginas", "5 sesiones de 20 min", "Guardar 15 citas", "5 chats IA"] },
  { name: "Simone de Beauvoir", emoji: "🦋", color: "bg-peachSoft", requirements: ["Leer 150 páginas", "Guardar 15 citas", "Crear 5 notas", "5 chats IA"] },
  { name: "Simone Weil", emoji: "🕯️", color: "bg-pinkSoft", requirements: ["5 sesiones profundas", "25 min cada una", "Guardar 10 citas"] },
];

export default function RetosPage() {
  const router = useRouter();
  const { user, loading } = useProfile();
  const [tab, setTab] = useState("Activos");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Retos literarios" emoji="🏆" subtitle="Descubre, comprende y encarna a tus autoras favoritas." />

      <div className="flex gap-2 mt-3.5">
        {["Activos", "Semanal", "Temporada"].map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-3.5">
        {AUTHORS.map((a) => (
          <Card key={a.name} onClick={() => setExpanded(expanded === a.name ? null : a.name)}>
            <div className="flex gap-3 items-center">
              <div className={`w-12 h-12 rounded-full ${a.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {a.emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <p className="font-extrabold text-ink m-0">{a.name}</p>
                  <span className="text-[10px] font-extrabold text-lavender bg-lavenderSoft px-2 py-0.5 rounded-full">
                    DESCUBRIR
                  </span>
                </div>
                <p className="text-[12.5px] text-inkSoft mt-0.5 mb-2">Aún no has comenzado este reto</p>
                <ProgressBar value={0} colorClass="bg-lavender" trackClass="bg-lavenderSoft" height={6} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-inkSoft">0% completado</span>
                  <span className="text-[11px] text-gold font-bold">+250 XP al completar</span>
                </div>
              </div>
            </div>
            {expanded === a.name && (
              <div className="mt-3 pt-3 border-t border-lavenderSoft">
                <p className="text-[11.5px] font-bold text-inkSoft mb-1.5">Para completar &quot;Descubrir&quot;:</p>
                {a.requirements.map((r) => (
                  <div key={r} className="flex items-center gap-2 py-1">
                    <div className="w-4 h-4 rounded-md border border-lavenderSoft" />
                    <span className="text-[12.5px] text-ink">{r}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4.5 mt-[18px] bg-gradient-to-br from-lavenderSoft to-skySoft rounded-2xl p-4 text-center">
        <p className="font-display font-bold text-[15px] text-ink m-0">Cada etapa es un viaje 🌷</p>
        <p className="text-[12.5px] text-inkSoft mt-1.5 mb-0 leading-relaxed">
          Descubrir → Comprender → Encarnar. Lee, reflexiona y conversa para avanzar en cada etapa de tus autoras favoritas.
        </p>
      </div>
    </div>
  );
}
