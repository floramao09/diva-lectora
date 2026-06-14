"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Settings, Bell, User, LogOut } from "lucide-react";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { supabase } from "@/lib/supabaseClient";

const MORE_ITEMS = [
  { href: "/niveles", label: "Niveles y XP", emoji: "⭐" },
  { href: "/viaja", label: "Viaja por el mundo", emoji: "🗺️" },
  { href: "/logros", label: "Logros y colecciones", emoji: "🏅" },
  { href: "/estadisticas", label: "Estadísticas", emoji: "📊" },
  { href: "/comunidad", label: "Comunidad", emoji: "💬" },
];

export default function MasPage() {
  const router = useRouter();
  const { user, loading } = useProfile();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Más" emoji="🌷" subtitle="Explora el resto de tu mundo lector." />

      <div className="flex flex-col gap-2.5 mt-4">
        {MORE_ITEMS.map((item) => (
          <Card key={item.href} onClick={() => router.push(item.href)} className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-lavenderSoft flex items-center justify-center text-xl flex-shrink-0">
              {item.emoji}
            </div>
            <p className="flex-1 font-extrabold text-ink m-0">{item.label}</p>
            <ChevronRight size={18} color="#A893C2" />
          </Card>
        ))}
      </div>

      <SectionTitle icon={<Settings size={18} color="#C9B6E8" />}>Configuración</SectionTitle>
      <div className="flex flex-col gap-2.5">
        <Card className="flex items-center gap-3.5">
          <Bell size={18} color="#C9B6E8" />
          <p className="flex-1 font-bold text-[13.5px] text-ink m-0">Notificaciones</p>
          <ChevronRight size={18} color="#A893C2" />
        </Card>
        <Card className="flex items-center gap-3.5">
          <User size={18} color="#C9B6E8" />
          <p className="flex-1 font-bold text-[13.5px] text-ink m-0">Mi cuenta</p>
          <ChevronRight size={18} color="#A893C2" />
        </Card>
        <Card onClick={handleLogout} className="flex items-center gap-3.5">
          <LogOut size={18} color="#E89BB0" />
          <p className="flex-1 font-bold text-[13.5px] text-ink m-0">Cerrar sesión</p>
        </Card>
      </div>
    </div>
  );
}
