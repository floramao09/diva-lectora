"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Search, Bookmark, BarChart3, Play, Volume2, MoreHorizontal, PenLine, MessageCircle, Copy, Share2,
} from "lucide-react";
import { ProgressBar, Pill } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { supabase } from "@/lib/supabaseClient";

const READER_BGS = [
  { name: "Crema", color: "#FFF8F1" },
  { name: "Rosa pastel", color: "#FDEEF3" },
  { name: "Lavanda", color: "#EFE6F9" },
  { name: "Celeste suave", color: "#EAF7FB" },
  { name: "Gris claro", color: "#F2F1F4" },
];

const READER_FONTS = ["Lora", "Merriweather", "Nunito", "Playfair Display", "Poppins"];
const UNDERLINE_CATEGORIES = [
  { name: "Personajes", color: "#FBD0DE" },
  { name: "Ideas", color: "#C9E8F2" },
  { name: "Amor", color: "#FFDCC2" },
  { name: "Sociedad", color: "#E6D9F7" },
  { name: "Inspiración", color: "#FFF1C2" },
];
const VOICE_OPTIONS = [
  { name: "Dulce", emoji: "🌸" },
  { name: "Cálida", emoji: "☕" },
  { name: "Clásica", emoji: "📜" },
  { name: "Profunda", emoji: "🌙" },
  { name: "Animada", emoji: "✨" },
];
const SPEEDS = ["1x", "1.25x", "1.5x", "2x", "2.5x"];

export default function LectorPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, addXp } = useProfile();
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<any>(null);
  const bookRef = useRef<any>(null);

  const [libro, setLibro] = useState<any>(null);
  const [bg, setBg] = useState(READER_BGS[0].color);
  const [font, setFont] = useState("Lora");
  const [fontSize, setFontSize] = useState(100);
  const [panel, setPanel] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Cargar metadatos del libro
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("libros")
        .select("*")
        .eq("id", params.bookId)
        .single();
      setLibro(data);
    })();
  }, [user, params.bookId]);

  // Inicializar epub.js cuando tenemos el libro
  useEffect(() => {
    if (!libro || !libro.archivo_url || !viewerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const ePub = (await import("epubjs")).default;

        const { data, error: urlErr } = await supabase.storage
          .from("epubs")
          .createSignedUrl(libro.archivo_url, 60 * 60);

        if (urlErr || !data?.signedUrl) {
          setError("No se pudo abrir el archivo EPUB.");
          return;
        }

        const book = ePub(data.signedUrl);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          spread: "none",
        });
        renditionRef.current = rendition;

        // Restaurar última posición o empezar desde el inicio
        await rendition.display(libro.ubicacion_actual || undefined);

        rendition.on("relocated", (location: any) => {
          if (cancelled) return;
          const pct = Math.round((location.start.percentage || 0) * 100);
          setProgress(pct);
          // Guardar posición en Supabase (silencioso)
          supabase
            .from("libros")
            .update({
              ubicacion_actual: location.start.cfi,
              estado: "leyendo",
            })
            .eq("id", libro.id);
        });

        rendition.on("selected", (cfiRange: string, contents: any) => {
          const text = contents.window.getSelection()?.toString() || "";
          if (text.trim().length > 0) {
            setSelectedText(text.trim());
            setHasSelection(true);
          }
        });

        applyStyles(rendition, bg, font, fontSize);
      } catch (e) {
        setError("Hubo un problema al cargar el libro.");
      }
    })();

    return () => {
      cancelled = true;
      if (bookRef.current) {
        try {
          bookRef.current.destroy();
        } catch {}
      }
    };
  }, [libro]);

  // Aplicar cambios de apariencia en vivo
  useEffect(() => {
    if (renditionRef.current) {
      applyStyles(renditionRef.current, bg, font, fontSize);
    }
  }, [bg, font, fontSize]);

  function applyStyles(rendition: any, bgColor: string, fontFamily: string, size: number) {
    const fontMap: Record<string, string> = {
      Lora: "'Lora', serif",
      Merriweather: "'Lora', serif",
      Nunito: "'Nunito', sans-serif",
      "Playfair Display": "'Playfair Display', serif",
      Poppins: "'Poppins', sans-serif",
    };
    rendition.themes.default({
      body: {
        background: `${bgColor} !important`,
        color: "#4A3D5C !important",
        "font-family": `${fontMap[fontFamily]} !important`,
        padding: "10px !important",
      },
    });
    rendition.themes.fontSize(`${size}%`);
  }

  const togglePanel = (p: string) => setPanel(panel === p ? null : p);

  const saveUnderline = async (categoria: string) => {
    if (!user || !selectedText) return;
    await supabase.from("subrayados").insert({
      usuaria_id: user.id,
      libro_id: libro?.id,
      texto: selectedText,
      categoria,
    });
    addXp(2);
    setPanel(null);
    setHasSelection(false);
    setSelectedCat(null);
  };

  const saveNote = async () => {
    if (!user || !noteText.trim()) return;
    await supabase.from("notas").insert({
      usuaria_id: user.id,
      libro_id: libro?.id,
      texto: noteText,
    });
    addXp(noteText.length > 200 ? 10 : 5);
    setNoteText("");
    setPanel(null);
    setHasSelection(false);
  };

  const goNext = () => renditionRef.current?.next();
  const goPrev = () => renditionRef.current?.prev();

  if (loading || !libro) {
    return <div className="p-6 text-center text-inkSoft">Cargando lector...</div>;
  }

  return (
    <div style={{ background: bg, minHeight: "100vh" }} className="transition-colors flex flex-col">
      {/* top bar */}
      <div
        className="flex items-center justify-between px-[18px] pt-[18px] pb-2.5 sticky top-0 z-10"
        style={{ background: bg }}
      >
        <button onClick={() => router.push("/biblioteca")} className="border-none bg-transparent">
          <ChevronLeft size={22} color="#5C4B73" />
        </button>
        <div className="text-center">
          <p className="font-extrabold text-sm text-ink m-0">{libro.titulo}</p>
          <p className="text-[11px] text-inkSoft m-0">{libro.autor}</p>
        </div>
        <div className="flex gap-3.5">
          <button onClick={() => togglePanel("stats")} className="border-none bg-transparent">
            <BarChart3 size={18} color="#5C4B73" />
          </button>
          <Bookmark size={18} color="#5C4B73" />
        </div>
      </div>

      {panel === "stats" && (
        <div className="px-[18px] pb-3.5">
          <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-[0_4px_20px_-8px_rgba(150,120,180,0.25)]">
            <Stat label="Progreso" value={`${progress}%`} />
            <Stat label="Estado" value={libro.estado} />
          </div>
        </div>
      )}

      {error && (
        <div className="px-[18px] py-4 text-center text-sm text-red-400">{error}</div>
      )}

      {/* epub viewer */}
      <div className="flex-1 relative" style={{ minHeight: "60vh" }}>
        <div ref={viewerRef} className="absolute inset-0" />
        {/* invisible tap zones for prev/next page */}
        <button
          onClick={goPrev}
          aria-label="Página anterior"
          className="absolute left-0 top-0 bottom-0 w-1/4 bg-transparent border-none z-[1]"
        />
        <button
          onClick={goNext}
          aria-label="Página siguiente"
          className="absolute right-0 top-0 bottom-0 w-1/4 bg-transparent border-none z-[1]"
        />
      </div>

      {/* selection toolbar */}
      {hasSelection && !panel && (
        <div className="fixed bottom-[90px] left-[18px] right-[18px] max-w-[420px] mx-auto bg-white rounded-2xl p-3 shadow-xl flex justify-around z-20">
          <ToolBtn icon={<PenLine size={18} />} label="Subrayar" onClick={() => setPanel("underline")} />
          <ToolBtn icon={<Bookmark size={18} />} label="Nota" onClick={() => setPanel("note")} />
          <ToolBtn
            icon={<MessageCircle size={18} />}
            label="Chat IA"
            onClick={() => {
              sessionStorage.setItem("diva_chat_fragment", selectedText);
              router.push("/conversa");
            }}
          />
          <ToolBtn
            icon={<Copy size={18} />}
            label="Copiar"
            onClick={() => navigator.clipboard?.writeText(selectedText)}
          />
          <ToolBtn icon={<Share2 size={18} />} label="Más" onClick={() => setHasSelection(false)} />
        </div>
      )}

      {/* underline category picker */}
      {panel === "underline" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Elige una categoría</p>
          <div className="flex gap-2 flex-wrap">
            {UNDERLINE_CATEGORIES.map((c) => (
              <button
                key={c.name}
                onClick={() => saveUnderline(c.name)}
                style={{ background: c.color }}
                className="border-none rounded-full px-3.5 py-2 text-ink font-bold text-xs"
              >
                {c.name}
              </button>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* note panel */}
      {panel === "note" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Escribe tu reflexión</p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="¿Qué piensas sobre este fragmento?"
            rows={3}
            className="w-full border border-lavenderSoft rounded-2xl p-3 text-sm outline-none resize-none"
          />
          <button
            onClick={saveNote}
            className="mt-2.5 w-full border-none bg-lavender text-white font-extrabold text-sm py-2.5 rounded-2xl"
          >
            Guardar nota ({noteText.length > 200 ? "+10" : "+5"} XP)
          </button>
        </FloatingPanel>
      )}

      {/* appearance panel */}
      {panel === "apariencia" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Color de fondo</p>
          <div className="flex gap-2.5 mb-3.5">
            {READER_BGS.map((b) => (
              <button
                key={b.name}
                onClick={() => setBg(b.color)}
                title={b.name}
                style={{ background: b.color, border: bg === b.color ? "2px solid #C9B6E8" : "1px solid #eee" }}
                className="w-8 h-8 rounded-full"
              />
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Tipografía</p>
          <div className="flex gap-2 flex-wrap mb-3.5">
            {READER_FONTS.map((f) => (
              <Pill key={f} active={font === f} onClick={() => setFont(f)}>
                {f}
              </Pill>
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Tamaño de fuente</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFontSize((s) => Math.max(70, s - 10))}
              className="border border-lavenderSoft bg-white rounded-xl w-9 h-8 font-extrabold text-ink"
            >
              A-
            </button>
            <span className="font-bold text-ink">{fontSize}%</span>
            <button
              onClick={() => setFontSize((s) => Math.min(200, s + 10))}
              className="border border-lavenderSoft bg-white rounded-xl w-9 h-8 font-extrabold text-ink"
            >
              A+
            </button>
          </div>
        </FloatingPanel>
      )}

      {/* voice panel (placeholder - TTS real puede integrarse después) */}
      {panel === "voz" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Voz de lectura en voz alta</p>
          <div className="flex gap-2 flex-wrap mb-3.5">
            {VOICE_OPTIONS.map((v) => (
              <Pill key={v.name}>{v.emoji} {v.name}</Pill>
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Velocidad</p>
          <div className="flex gap-2 flex-wrap">
            {SPEEDS.map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
          <p className="text-[11px] text-inkSoft mt-3">
            🔧 La lectura en voz alta con IA requiere conectar un servicio de texto-a-voz (puede agregarse en una siguiente fase).
          </p>
        </FloatingPanel>
      )}

      {/* more panel */}
      {panel === "mas" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Más herramientas</p>
          <div className="flex flex-col gap-1">
            {[
              ["📑 Capítulos", "Usa los bordes de la pantalla para navegar"],
              ["⭐ Citas favoritas", "Ver en Logros y colecciones"],
              ["📝 Mis notas", "Guardadas en tu cuenta"],
            ].map(([t, s]) => (
              <div key={t} className="flex justify-between py-2.5 border-b border-lavenderSoft">
                <span className="font-bold text-sm text-ink">{t}</span>
                <span className="text-xs text-inkSoft">{s}</span>
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* bottom toolbar */}
      <div className="sticky bottom-0 bg-white border-t border-lavenderSoft px-6 pt-3.5 pb-[18px] max-w-[420px] mx-auto w-full">
        <ProgressBar value={progress} colorClass="bg-lavender" trackClass="bg-lavenderSoft" height={4} />
        <p className="text-center text-xs text-inkSoft my-2">{progress}% leído</p>
        <div className="flex justify-around items-center">
          <IconBtn onClick={() => togglePanel("apariencia")} label="Apariencia">
            <div className="font-display font-extrabold text-base">Aa</div>
          </IconBtn>
          <IconBtn onClick={() => togglePanel("stats")} label="Estadísticas">
            <BarChart3 size={20} color="#5C4B73" />
          </IconBtn>
          <button onClick={goNext} className="border-none bg-transparent scale-125">
            <div className="w-[46px] h-[46px] rounded-full bg-lavender flex items-center justify-center">
              <Play size={18} color="#fff" fill="#fff" />
            </div>
          </button>
          <IconBtn onClick={() => togglePanel("voz")} label="IA Voz">
            <Volume2 size={20} color="#5C4B73" />
          </IconBtn>
          <IconBtn onClick={() => togglePanel("mas")} label="Más">
            <MoreHorizontal size={20} color="#5C4B73" />
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-inkSoft m-0">{label}</p>
      <p className="font-display text-base font-extrabold text-ink mt-0.5 mb-0">{value}</p>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 border-none bg-transparent text-lavender text-[11px] font-bold">
      {icon}
      {label}
    </button>
  );
}

function FloatingPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-[145px] left-[18px] right-[18px] max-w-[420px] mx-auto bg-white rounded-2xl p-4 shadow-xl z-20 max-h-[280px] overflow-y-auto">
      {children}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="border-none bg-transparent flex flex-col items-center gap-1 text-ink">
      {children}
      <span className="text-[10px] font-bold text-inkSoft">{label}</span>
    </button>
  );
}
