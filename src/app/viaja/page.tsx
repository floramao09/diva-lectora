"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe2, Award, Sparkles } from "lucide-react";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";

const COUNTRIES = [
  { country: "Reino Unido", author: "Jane Austen", emoji: "🇬🇧" },
  { country: "Chile", author: "Gabriela Mistral", emoji: "🇨🇱" },
  { country: "Francia", author: "Simone de Beauvoir", emoji: "🇫🇷" },
  { country: "Japón", author: "Yukio Mishima", emoji: "🇯🇵" },
  { country: "Estados Unidos", author: "Audre Lorde", emoji: "🇺🇸" },
  { country: "Nigeria", author: "Chimamanda Ngozi Adichie", emoji: "🇳🇬" },
];

export default function ViajaPage() {
  const router = useRouter();
  const { user, loading } = useProfile();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Viaja por el mundo" emoji="🗺️" subtitle="Desbloquea países leyendo autoras de cada lugar." />

      <Card className="mt-3.5 bg-gradient-to-br from-skySoft to-lavenderSoft text-center py-7">
        <Globe2 size={40} color="#C9B6E8" className="mx-auto" />
        <p className="font-display font-bold text-base text-ink mt-3 mb-0">Tu mapa está en blanco</p>
        <p className="text-[12.5px] text-inkSoft mt-1.5 mb-0">0 de {COUNTRIES.length} países desbloqueados</p>
      </Card>

      <SectionTitle icon={<Sparkles size={18} color="#C9B6E8" />}>Países por descubrir</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {COUNTRIES.map((c) => (
          <Card key={c.country} className="flex items-center gap-3 opacity-70">
            <div className="w-11 h-11 rounded-full bg-lavenderSoft flex items-center justify-center text-xl flex-shrink-0">
              {c.emoji}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink m-0">{c.country}</p>
              <p className="text-xs text-inkSoft m-0">Lee a {c.author} para desbloquear</p>
            </div>
            <span className="text-inkSoft">🔒</span>
          </Card>
        ))}
      </div>

      <SectionTitle icon={<Award size={18} color="#F0C36B" />}>Pasaporte lector</SectionTitle>
      <Card className="text-center py-6">
        <p className="text-3xl m-0">📔</p>
        <p className="text-[12.5px] text-inkSoft mt-2.5 mb-0">
          Tu pasaporte está vacío. Cada autora que leas te dará un sello único.
        </p>
      </Card>
    </div>
  );
}
