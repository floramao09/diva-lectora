"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Bookmark, BarChart3, Volume2, MoreHorizontal,
  PenLine, MessageCircle, Copy, ChevronRight, ChevronLeft as Prev,
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [libro, setLibro] = useState<any>(null);
  const [bg, setBg] = useState(READER_BGS[0].color);
  const [font, setFont] = useState("Lora");
  const [fontSize, setFontSize] = useState(18);
  const [panel, setPanel] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loadingBook, setLoadingBook] = useState(true);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [epubUrl, setEpubUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Cargar metadatos del libro
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("libros")
        .select("*")
        .eq("id", params.bookId)
        .single();
      setLibro(data);
    })();
  }, [user, params.bookId]);

  // Obtener URL firmada del EPUB
  useEffect(() => {
    if (!libro?.archivo_url) return;
    (async () => {
      setLoadingBook(true);
      const { data, error: urlErr } = await supabase.storage
        .from("epubs")
        .createSignedUrl(libro.archivo_url, 60 * 60);
      if (urlErr || !data?.signedUrl) {
        setError("No se pudo abrir el archivo. Verifica que existe en Supabase Storage.");
        setLoadingBook(false);
        return;
      }
      setEpubUrl(data.signedUrl);
    })();
  }, [libro]);

  // Cuando el iframe carga, inyectar epub.js desde CDN
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !epubUrl) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Escribir HTML base en el iframe
    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"><\/script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    background: ${bg}; 
    font-family: '${font}', serif;
    font-size: ${fontSize}px;
    line-height: 1.8;
    color: #4A3D5C;
    overflow: hidden;
  }
  #viewer { width: 100%; height: 100vh; }
  .epub-container { width: 100% !important; height: 100% !important; }
  .epub-view { width: 100% !important; height: 100% !important; }
  .epub-view iframe { width: 100% !important; height: 100% !important; }
</style>
</head>
<body>
<div id="viewer"></div>
<script>
  const book = ePub("${epubUrl}");
  const rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%",
    spread: "none"
  });
  rendition.display();
  
  rendition.on("relocated", function(location) {
    const pct = Math.round((location.start.percentage || 0) * 100);
    window.parent.postMessage({ type: "progress", pct: pct, cfi: location.start.cfi }, "*");
  });

  rendition.on("selected", function(cfiRange, contents) {
    const text = contents.window.getSelection()?.toString() || "";
    if (text.trim()) {
      window.parent.postMessage({ type: "selection", text: text.trim() }, "*");
    }
  });

  window.goNext = function() { rendition.next(); };
  window.goPrev = function() { rendition.prev(); };
<\/script>
</body>
</html>`);
    iframeDoc.close();
    setLoadingBook(false);
  }, [epubUrl, bg, font, fontSize]);

  // Escuchar mensajes del iframe (progreso, selección)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "progress") {
        setProgress(e.data.pct);
        if (libro?.id) {
          supabase.from("libros").update({
            ubicacion_actual: e.data.cfi,
            estado: "leyendo",
          }).eq("id", libro.id).then(() => {});
        }
      }
      if (e.data?.type === "selection") {
        setSelectedText(e.data.text);
        setHasSelection(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [libro]);

  const goNext = () => {
    iframeRef.current?.contentWindow?.postMessage("next", "*");
    (iframeRef.current?.contentWindow as any)?.goNext?.();
  };

  const goPrev = () => {
    (iframeRef.current?.contentWindow as any)?.goPrev?.();
  };

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

  if (loading || !libro) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FFF8F1" }}>
        <p className="text-inkSoft font-body">Cargando lector... 🌸</p>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: "100vh" }} className="flex flex-col transition-colors">
      {/* top bar */}
      <div className="flex items-center justify-between px-[18px] pt-[18px] pb-2 sticky top-0 z-10" style={{ background: bg }}>
        <button onClick={() => router.push("/biblioteca")} className="border-none bg-transparent cursor-pointer">
          <ChevronLeft size={22} color="#5C4B73" />
        </button>
        <div className="text-center flex-1 mx-2">
          <p className="font-extrabold text-sm text-ink m-0 truncate">{libro.titulo}</p>
          <p className="text-[11px] text-inkSoft m-0">{libro.autor}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => togglePanel("stats")} className="border-none bg-transparent cursor-pointer">
            <BarChart3 size={18} color="#5C4B73" />
          </button>
          <Bookmark size={18} color="#5C4B73" />
        </div>
      </div>

      {panel === "stats" && (
        <div className="px-[18px] pb-3">
          <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3 shadow-md">
            <Stat label="Progreso" value={`${progress}%`} />
            <Stat label="Estado" value={libro.estado || "leyendo"} />
          </div>
        </div>
      )}

      {error && (
        <div className="px-[18px] py-4 text-center text-sm text-red-400">{error}</div>
      )}

      {/* EPUB viewer via iframe */}
      <div className="flex-1 relative" style={{ height: "calc(100vh - 160px)" }}>
        {loadingBook && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: bg }}>
            <p className="text-inkSoft text-sm">Cargando libro... 📖</p>
          </div>
        )}
        {epubUrl && (
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            src="about:blank"
            className="w-full h-full border-none"
            title="Lector EPUB"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {/* Botones de navegación invisibles en los bordes */}
        <button onClick={goPrev} aria-label="Anterior" className="absolute left-0 top-0 bottom-[60px] w-[60px] bg-transparent border-none z-10 cursor-pointer" />
        <button onClick={goNext} aria-label="Siguiente" className="absolute right-0 top-0 bottom-[60px] w-[60px] bg-transparent border-none z-10 cursor-pointer" />
      </div>

      {/* Selection toolbar */}
      {hasSelection && !panel && (
        <div className="fixed bottom-[90px] left-[18px] right-[18px] max-w-[480px] mx-auto bg-white rounded-2xl p-3 shadow-xl flex justify-around z-20">
          <ToolBtn icon={<PenLine size={18} />} label="Subrayar" onClick={() => setPanel("underline")} />
          <ToolBtn icon={<Bookmark size={18} />} label="Nota" onClick={() => setPanel("note")} />
          <ToolBtn icon={<MessageCircle size={18} />} label="Chat IA" onClick={() => {
            sessionStorage.setItem("diva_chat_fragment", selectedText);
            router.push("/conversa");
          }} />
          <ToolBtn icon={<Copy size={18} />} label="Copiar" onClick={() => navigator.clipboard?.writeText(selectedText)} />
          <ToolBtn icon={<MoreHorizontal size={18} />} label="Más" onClick={() => setHasSelection(false)} />
        </div>
      )}

      {/* Underline panel */}
      {panel === "underline" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Elige una categoría</p>
          <div className="flex gap-2 flex-wrap">
            {UNDERLINE_CATEGORIES.map((c) => (
              <button key={c.name} onClick={() => saveUnderline(c.name)}
                style={{ background: c.color }}
                className="border-none rounded-full px-3 py-1.5 text-ink font-bold text-xs cursor-pointer">
                {c.name}
              </button>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* Note panel */}
      {panel === "note" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Escribe tu reflexión</p>
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
            placeholder="¿Qué piensas sobre este fragmento?"
            rows={3}
            className="w-full border border-lavenderSoft rounded-xl p-3 text-sm outline-none resize-none" />
          <button onClick={saveNote}
            className="mt-2 w-full border-none bg-lavender text-white font-extrabold text-sm py-2.5 rounded-xl cursor-pointer">
            Guardar ({noteText.length > 200 ? "+10" : "+5"} XP)
          </button>
        </FloatingPanel>
      )}

      {/* Appearance panel */}
      {panel === "apariencia" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Color de fondo</p>
          <div className="flex gap-2 mb-3">
            {READER_BGS.map((b) => (
              <button key={b.name} onClick={() => setBg(b.color)} title={b.name}
                style={{ background: b.color, border: bg === b.color ? "2px solid #C9B6E8" : "1px solid #eee" }}
                className="w-8 h-8 rounded-full cursor-pointer" />
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Tipografía</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {READER_FONTS.map((f) => (
              <Pill key={f} active={font === f} onClick={() => setFont(f)}>{f}</Pill>
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Tamaño</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(s => Math.max(13, s - 1))}
              className="border border-lavenderSoft bg-white rounded-lg w-8 h-8 font-bold text-ink cursor-pointer">A-</button>
            <span className="font-bold text-ink text-sm">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(28, s + 1))}
              className="border border-lavenderSoft bg-white rounded-lg w-8 h-8 font-bold text-ink cursor-pointer">A+</button>
          </div>
          <p className="text-[10px] text-inkSoft mt-2">💡 Recarga el libro para aplicar cambios de fuente y fondo</p>
        </FloatingPanel>
      )}

      {/* Voice panel */}
      {panel === "voz" && (
        <FloatingPanel>
          <p className="text-xs font-bold text-inkSoft mb-2">Voz de lectura</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {VOICE_OPTIONS.map((v) => (
              <Pill key={v.name}>{v.emoji} {v.name}</Pill>
            ))}
          </div>
          <p className="text-xs font-bold text-inkSoft mb-2">Velocidad</p>
          <div className="flex gap-2 flex-wrap">
            {SPEEDS.map((s) => <Pill key={s}>{s}</Pill>)}
          </div>
        </FloatingPanel>
      )}

      {/* More panel */}
      {panel === "mas" && (
        <FloatingPanel>
          <div className="flex flex-col gap-1">
            {[
              ["📑 Capítulos", "Toca los bordes de pantalla para navegar"],
              ["📝 Mis notas", "Guardadas en tu cuenta"],
              ["⭐ Citas guardadas", "Ver en Logros"],
            ].map(([t, s]) => (
              <div key={t} className="flex justify-between py-2 border-b border-lavenderSoft">
                <span className="font-bold text-sm text-ink">{t}</span>
                <span className="text-xs text-inkSoft">{s}</span>
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* Bottom toolbar */}
      <div className="sticky bottom-0 bg-white border-t border-lavenderSoft px-6 pt-3 pb-4">
        <ProgressBar value={progress} colorClass="bg-lavender" trackClass="bg-lavenderSoft" height={4} />
        <p className="text-center text-xs text-inkSoft my-1.5">{progress}% leído</p>
        <div className="flex justify-around items-center">
          <IconBtn onClick={() => togglePanel("apariencia")} label="Apariencia">
            <div className="font-display font-extrabold text-base text-ink">Aa</div>
          </IconBtn>
          <IconBtn onClick={goPrev} label="Anterior">
            <Prev size={20} color="#5C4B73" />
          </IconBtn>
          <IconBtn onClick={goNext} label="Siguiente">
            <ChevronRight size={20} color="#5C4B73" />
          </IconBtn>
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
      <p className="font-display text-base font-extrabold text-ink mt-0.5 m-0">{value}</p>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 border-none bg-transparent text-lavender text-[11px] font-bold cursor-pointer">
      {icon}{label}
    </button>
  );
}

function FloatingPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-[140px] left-[18px] right-[18px] max-w-[480px] mx-auto bg-white rounded-2xl p-4 shadow-xl z-20 max-h-[260px] overflow-y-auto">
      {children}
    </div>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="border-none bg-transparent flex flex-col items-center gap-1 cursor-pointer">
      {children}
      <span className="text-[10px] font-bold text-inkSoft">{label}</span>
    </button>
  );
}
