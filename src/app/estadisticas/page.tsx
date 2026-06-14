"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Card, Pill, PageHeader, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";

export default function EstadisticasPage() {
  const router = useRouter();
  const { user, profile, loading } = useProfile();
  const [period, setPeriod] = useState("Semanal");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !profile) return <div className="p-6 text-center text-inkSoft">Cargando...</div>;

  const stats = [
    { label: "Libros terminados", value: "0", emoji: "📕" },
    { label: "Páginas leídas", value: "0", emoji: "📄" },
    { label: "Palabras leídas", value: "0", emoji: "🔤" },
    { label: "Minutos leídos", value: String(profile.minutos_hoy), emoji: "⏱️" },
    { label: "Horas leídas", value: "0h", emoji: "🕰️" },
    { label: "Racha actual", value: `${profile.racha} días`, emoji: "🔥" },
    { label: "XP total", value: profile.xp.toLocaleString(), emoji: "⭐" },
    { label: "Retos completados", value: "0", emoji: "🏆" },
  ];

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Estadísticas" emoji="📊" subtitle="Aquí verás tu progreso transformarse en hábito." />

      <div className="flex gap-2 mt-3.5">
        {["Semanal", "Mensual", "Anual"].map((p) => (
          <Pill key={p} active={period === p} onClick={() => setPeriod(p)}>{p}</Pill>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-3.5">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="text-xl">{s.emoji}</div>
            <p className="font-display text-2xl font-extrabold text-ink mt-2 mb-0">{s.value}</p>
            <p className="text-[11.5px] text-inkSoft mt-0.5 mb-0">{s.label}</p>
          </Card>
        ))}
      </div>

      <SectionTitle icon={<BarChart3 size={18} color="#C9B6E8" />}>Historial de lectura</SectionTitle>
      <Card>
        <div className="flex items-end gap-2" style={{ height: 90 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-lavenderSoft rounded" style={{ height: 4 }} />
              <span className="text-[11px] text-inkSoft">{d}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-inkSoft mt-3 mb-0">
          Todavía no hay datos esta semana. ¡Empieza a leer para ver tu progreso! 🌱
        </p>
      </Card>
    </div>
  );
}
