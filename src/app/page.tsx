"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flame, BookOpen, Trophy, Sparkles, Heart, Star, Download } from "lucide-react";
import { Card, ProgressBar, EmptyState, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { getLevelInfo } from "@/lib/levels";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading, addXp } = useProfile();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !profile) {
    return (
      <div className="p-6 text-center text-inkSoft font-body">Cargando...</div>
    );
  }

  const { current, next, pct } = getLevelInfo(profile.xp);

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-inkSoft text-sm m-0">¡Bienvenida!</p>
          <h1 className="font-display text-2xl font-extrabold text-ink mt-0.5">
            Hola, {profile.nombre} ✨
          </h1>
        </div>
        <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-pinkSoft to-lavenderSoft flex items-center justify-center text-2xl">
          {current.animal}
        </div>
      </div>

      {/* streak + minutes */}
      <div className="flex gap-3 mt-[18px]">
        <Card className="flex-1 bg-gradient-to-br from-peachSoft to-pinkSoft">
          <Flame size={20} color="#F0986E" />
          <p className="text-sm text-inkSoft mt-2 mb-0">Racha actual</p>
          <p className="font-display text-2xl font-extrabold text-ink m-0">
            {profile.racha} días
          </p>
          <p className="text-[11.5px] text-inkSoft mt-1 mb-0">
            {profile.racha === 0 ? "Lee hoy para comenzar 🌱" : "¡Sigue así! 🔥"}
          </p>
        </Card>
        <Card className="flex-1 bg-gradient-to-br from-skySoft to-lavenderSoft">
          <BookOpen size={20} color="#8E7AB5" />
          <p className="text-sm text-inkSoft mt-2 mb-0">Minutos hoy</p>
          <p className="font-display text-2xl font-extrabold text-ink m-0">
            {profile.minutos_hoy} min
          </p>
          <p className="text-[11.5px] text-inkSoft mt-1 mb-0">Meta diaria: 20 min</p>
        </Card>
      </div>

      {/* current book */}
      <SectionTitle icon={<BookOpen size={18} color="#C9B6E8" />}>Tu lectura</SectionTitle>
      <EmptyState
        emoji="📖"
        title="Aún no tienes un libro activo"
        text="Importa tu primer EPUB o explora la biblioteca para empezar tu aventura literaria."
        cta="Ir a mi biblioteca"
        onCta={() => router.push("/biblioteca")}
      />

      {/* daily challenge */}
      <SectionTitle icon={<Trophy size={18} color="#F0986E" />}>Desafío del día</SectionTitle>
      <Card className="bg-gradient-to-br from-white to-peachSoft">
        <div className="flex justify-between mb-2">
          <p className="font-extrabold text-ink m-0">Lee tu primera página</p>
          <span className="text-sm text-inkSoft">{claimed ? "1 / 1" : "0 / 1"}</span>
        </div>
        <ProgressBar value={claimed ? 100 : 0} colorClass="bg-[#F0986E]" trackClass="bg-peachSoft" />
        {claimed ? (
          <p className="text-xs text-[#F0986E] font-bold mt-2 mb-0">¡Completado! +5 XP ✨</p>
        ) : (
          <button
            onClick={() => {
              setClaimed(true);
              addXp(5);
            }}
            className="mt-2.5 w-full border-none bg-[#F0986E] text-white font-extrabold text-sm py-2.5 rounded-xl"
          >
            Marcar como leída (+5 XP)
          </button>
        )}
      </Card>

      {/* quote of the day */}
      <SectionTitle icon={<Sparkles size={18} color="#C9B6E8" />}>Frase del día</SectionTitle>
      <Card className="bg-gradient-to-br from-lavenderSoft to-skySoft">
        <p className="font-display italic text-base text-ink leading-relaxed m-0">
          &quot;Una habitación propia y dinero propio son, sin duda, muy importantes.&quot;
        </p>
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-sm text-inkSoft">— Virginia Woolf</span>
          <Heart size={18} color="#A893C2" />
        </div>
      </Card>

      {/* level snapshot */}
      <SectionTitle icon={<Star size={18} color="#F0C36B" />}>Tu nivel</SectionTitle>
      <Card className="flex items-center gap-3.5 bg-gradient-to-br from-peachSoft to-pinkSoft">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
          {current.animal}
        </div>
        <div className="flex-1">
          <p className="text-xs text-inkSoft m-0">Nivel {current.n}</p>
          <p className="font-display font-extrabold text-base text-ink mt-0.5 mb-1.5">
            {current.title}
          </p>
          <ProgressBar value={pct} colorClass="bg-gold" trackClass="bg-white" />
          <p className="text-[11px] text-inkSoft mt-1 mb-0">
            {profile.xp.toLocaleString()} / {next ? next.xp.toLocaleString() : "—"} XP
            {next ? ` · Próximo: ${next.title} ${next.animal}` : " · ¡Nivel máximo!"}
          </p>
        </div>
      </Card>

      {/* quick access */}
      <SectionTitle icon={<Sparkles size={18} color="#C9B6E8" />}>Accesos rápidos</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => router.push("/biblioteca")}
          className="flex flex-col items-start gap-2 bg-lavenderSoft border-none rounded-2xl p-3.5 font-extrabold text-sm text-ink text-left"
        >
          <Download size={18} color="#C9B6E8" />
          <span>Importar EPUB</span>
        </button>
        <button
          onClick={() => router.push("/conversa")}
          className="flex flex-col items-start gap-2 bg-pinkSoft border-none rounded-2xl p-3.5 font-extrabold text-sm text-ink text-left"
        >
          <Sparkles size={18} color="#E89BB0" />
          <span>Hablar con la IA</span>
        </button>
      </div>
    </div>
  );
}
