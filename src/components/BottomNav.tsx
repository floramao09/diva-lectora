"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Trophy, Sparkles, MoreHorizontal } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/retos", label: "Retos", icon: Trophy },
  { href: "/conversa", label: "Conversa", icon: Sparkles },
  { href: "/mas", label: "Más", icon: MoreHorizontal },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="flex justify-around items-center py-3 px-1 bg-white border-t border-lavenderSoft flex-shrink-0 sticky bottom-0">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-1 ${
              active ? "text-lavender" : "text-inkSoft"
            }`}
          >
            <Icon size={20} />
            <span className={`text-[10px] ${active ? "font-extrabold" : "font-semibold"}`}>
              {t.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
