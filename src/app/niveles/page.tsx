"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Star } from "lucide-react";
import { Card, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { getLevelInfo, LEVELS } from "@/lib/levels";

const XP_ACTIONS = [
  { label: "Leer 1 página", xp: 1, emoji: "📄" },
  { label: "Leer 10 minutos", xp: 2, emoji: "⏱️" },
  { label: "Guardar cita", xp: 2, emoji: "🔖" },
  { label: "Crear nota", xp: 5, emoji: "📝" },
  { label: "Abrir Chat IA", xp: 3, emoji: "💬" },
  { label: "Conversación de 5 mensajes", xp: 10, emoji: "💭" },
  { label: "Completar capítulo", xp: 20, emoji: "✅" },
  { label: "Completar libro", xp: 100, emoji: "🎉" },
  { label: "Racha de 7 días", xp: 50, emoji: "🔥" },
  { label: "Completar reto Descubrir", xp: 250, emoji: "🏆" },
];

const STAGE_NAMES = ["El Despertar", "El Hábito", "La Profundidad", "La Leyenda", "La Emperatriz"];

export default function NivelesPage() {
  const router = useRouter();
  const { user, profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !profile) return <div className="p-6 text-center text-inkSoft">Cargando...</div>;

  const { current, next, pct } = getLevelInfo(profile.xp);
  const stageStart = Math.floor((current.n - 1) / 10) * 10;
  const stageLevels = LEVELS.slice(stageStart, stageStart + 10);
  const stageName = STAGE_NAMES[Math.floor(stageStart / 10)] || "";

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Tu camino lector" emoji="🌟" />

      <div className="mt-4 rounded-3xl p-[22px] text-center text-white bg-gradient-to-br from-lavender to-pink">
        <div className="w-[76px] h-[76px] rounded-full bg-white mx-auto flex items-center justify-center text-4xl shadow-md">
          {current.animal}
        </div>
        <p className="text-[13px] opacity-90 mt-3 mb-0">Nivel {current.n}</p>
        <p className="font-display font-extrabold text-2xl mt-0.5 mb-3.5">{current.title}</p>
        <ProgressBar value={pct} colorClass="bg-white" trackClass="bg-white/30" height={8} />
        <p className="text-xs opacity-90 mt-2 mb-0">
          {profile.xp.toLocaleString()} / {next ? next.xp.toLocaleString() : "—"} XP · {pct}%
        </p>
        <p className="text-[13px] mt-2.5 mb-0">
          {next ? <>Próximo nivel: <strong>{next.title}</strong> {next.animal}</> : "¡Has alcanzado el nivel máximo! 👑"}
        </p>
      </div>

      <SectionTitle icon={<Sparkles size={18} color="#C9B6E8" />}>
        Etapa {Math.floor(stageStart / 10) + 1} · {stageName}
      </SectionTitle>
      <div className="flex flex-col gap-2.5">
        {stageLevels.map((l) => (
          <Card
            key={l.n}
            className={`flex items-center gap-3 border-2 ${
              l.n === current.n ? "border-lavender" : "border-transparent"
            } ${l.n < current.n ? "opacity-60" : ""}`}
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                l.n === current.n ? "bg-lavender" : "bg-lavenderSoft"
              }`}
            >
              {l.animal}
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-inkSoft m-0">
                Nivel {l.n} {l.n === current.n && "· Actual"}
              </p>
              <p className="font-display font-extrabold text-sm text-ink m-0">{l.title}</p>
            </div>
            <span className="text-[11px] text-inkSoft">{l.xp.toLocaleString()} XP</span>
          </Card>
        ))}
        <p className="text-center text-xs text-inkSoft">
          ... hasta el Nivel 50 · Emperatriz de las Letras 👑
        </p>
      </div>

      <SectionTitle icon={<Star size={18} color="#F0C36B" />}>¿Cómo ganas XP?</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {XP_ACTIONS.map((a) => (
          <div key={a.label} className="bg-white rounded-2xl p-3.5 shadow-[0_4px_14px_-8px_rgba(150,120,180,0.25)]">
            <div className="text-xl">{a.emoji}</div>
            <p className="text-[12.5px] font-bold text-ink mt-1.5 mb-0.5">{a.label}</p>
            <p className="text-[13px] font-extrabold text-gold m-0">+{a.xp} XP</p>
          </div>
        ))}
      </div>

      <div className="mt-[18px] bg-skySoft rounded-2xl p-4">
        <p className="font-display font-bold text-sm text-ink m-0">🦚 No solo se trata de páginas</p>
        <p className="text-[12.5px] text-inkSoft mt-1.5 mb-0 leading-relaxed">
          Leer, pensar, reflexionar, analizar y conversar — todo cuenta. Tu nivel representa tu evolución como lectora, no solo tu velocidad.
        </p>
      </div>
    </div>
  );
}
