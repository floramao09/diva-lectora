"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, User } from "lucide-react";
import { Card, Pill, PageHeader, SectionTitle, EmptyState } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { getLevelInfo } from "@/lib/levels";

export default function ComunidadPage() {
  const router = useRouter();
  const { user, profile, loading } = useProfile();
  const [tab, setTab] = useState("Global");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !profile) return <div className="p-6 text-center text-inkSoft">Cargando...</div>;

  const { current } = getLevelInfo(profile.xp);

  const posts = [
    { name: "LunaLectora", time: "hace 2 h", text: "Empezando 'Una habitación propia' hoy... ¡el nivel 1 nunca se sintió tan emocionante! 🌷", likes: 12, emoji: "🐰" },
    { name: "MeliBooks", time: "hace 4 h", text: "Acabo de descubrir el Panel de Debate, ¡es como tener un club de lectura siempre disponible! ✨", likes: 28, emoji: "🦊" },
  ];

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Comunidad lectora" emoji="💬" subtitle="Conecta, comparte y descubre con otras lectoras." />

      <div className="flex gap-2 mt-3.5">
        {["Destacados", "Siguiendo", "Global"].map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Pill>
        ))}
      </div>

      {tab === "Siguiendo" ? (
        <div className="mt-3.5">
          <EmptyState
            emoji="🌸"
            title="Aún no sigues a nadie"
            text="Encuentra lectoras con tus gustos y comienza a construir tu comunidad literaria."
            cta="Explorar lectoras"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-3.5">
          {posts.map((p, i) => (
            <Card key={i}>
              <div className="flex gap-2.5 items-center mb-2">
                <div className="w-9 h-9 rounded-full bg-lavenderSoft flex items-center justify-center text-lg">
                  {p.emoji}
                </div>
                <div>
                  <p className="font-extrabold text-[13px] text-ink m-0">{p.name}</p>
                  <p className="text-[11px] text-inkSoft m-0">{p.time}</p>
                </div>
              </div>
              <p className="text-[13px] text-ink leading-relaxed m-0">{p.text}</p>
              <div className="flex gap-4 mt-2.5">
                <span className="flex items-center gap-1 text-xs text-inkSoft">
                  <Heart size={14} /> {p.likes}
                </span>
                <span className="flex items-center gap-1 text-xs text-inkSoft">
                  <MessageCircle size={14} /> Comentar
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle icon={<User size={18} color="#C9B6E8" />}>Tu perfil</SectionTitle>
      <Card className="flex items-center gap-3.5">
        <div className="w-[54px] h-[54px] rounded-full bg-gradient-to-br from-pinkSoft to-lavenderSoft flex items-center justify-center text-2xl">
          {current.animal}
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-ink m-0">{profile.nombre}</p>
          <p className="text-xs text-inkSoft mt-0.5 mb-0">
            Nivel {current.n} · {current.title} · 0 publicaciones
          </p>
        </div>
      </Card>
    </div>
  );
}
