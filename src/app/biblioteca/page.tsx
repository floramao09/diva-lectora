"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronRight, Sparkles, BarChart3 } from "lucide-react";
import { Card, Pill, EmptyState, PageHeader, ProgressBar, SectionTitle } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { supabase } from "@/lib/supabaseClient";

type Libro = {
  id: string;
  titulo: string;
  autor: string | null;
  archivo_url: string | null;
  pagina_actual: number;
  paginas_totales: number;
  estado: string;
  favorito: boolean;
};

const FILTERS = ["Todos", "Leyendo", "Leídos", "Pendientes", "Favoritos"];

export default function BibliotecaPage() {
  const router = useRouter();
  const { user, loading } = useProfile();
  const [filter, setFilter] = useState("Todos");
  const [libros, setLibros] = useState<Libro[]>([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const loadLibros = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    const { data } = await supabase
      .from("libros")
      .select("*")
      .eq("usuaria_id", user.id)
      .order("created_at", { ascending: false });
    setLibros((data as Libro[]) || []);
    setFetching(false);
  }, [user]);

  useEffect(() => {
    if (user) loadLibros();
  }, [user, loadLibros]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadError("");

    if (!file.name.toLowerCase().endsWith(".epub")) {
      setUploadError("Por favor selecciona un archivo .epub");
      return;
    }

    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("epubs")
        .upload(path, file);

      if (uploadErr) {
        setUploadError("No se pudo subir el archivo: " + uploadErr.message);
        setUploading(false);
        return;
      }

      // Extraer título/autor básico desde el nombre del archivo (se puede mejorar después)
      const nombreBase = file.name.replace(/\.epub$/i, "");

      const { error: insertErr } = await supabase.from("libros").insert({
        usuaria_id: user.id,
        titulo: nombreBase,
        autor: "Autora desconocida",
        archivo_url: path,
        estado: "pendiente",
      });

      if (insertErr) {
        setUploadError("Se subió el archivo pero no se pudo guardar en tu biblioteca: " + insertErr.message);
      } else {
        await loadLibros();
      }
    } finally {
      setUploading(false);
    }
  };

  const shown = libros.filter((b) => {
    if (filter === "Todos") return true;
    if (filter === "Leyendo") return b.estado === "leyendo";
    if (filter === "Leídos") return b.estado === "leido";
    if (filter === "Pendientes") return b.estado === "pendiente";
    if (filter === "Favoritos") return b.favorito;
    return true;
  });

  return (
    <div className="px-[18px] pt-5 pb-[100px]">
      <PageHeader title="Mi Biblioteca" emoji="📚" />

      <div className="flex gap-2.5 items-center mt-3.5">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-3.5 py-2.5 shadow-[0_4px_14px_-8px_rgba(150,120,180,0.3)]">
          <Search size={16} color="#A893C2" />
          <span className="text-sm text-inkSoft">Buscar libros, autoras...</span>
        </div>
        <label className="w-[42px] h-[42px] rounded-2xl bg-lavender text-white flex items-center justify-center cursor-pointer flex-shrink-0">
          {uploading ? "⏳" : <Plus size={20} />}
          <input
            type="file"
            accept=".epub"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 mt-2">{uploadError}</p>
      )}

      <div className="flex gap-2 mt-3.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Pill>
        ))}
      </div>

      <div className="mt-3.5">
        {fetching ? (
          <p className="text-center text-inkSoft text-sm py-6">Cargando tu biblioteca...</p>
        ) : shown.length === 0 ? (
          <EmptyState
            emoji="🌸"
            title="Tu biblioteca está esperando"
            text="Importa un archivo EPUB para empezar a leer, subrayar y conversar sobre tus libros favoritos."
            cta="Importar mi primer EPUB"
            onCta={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {shown.map((b) => (
              <Card
                key={b.id}
                onClick={() => router.push(`/lector/${b.id}`)}
                className="flex gap-3.5 items-center"
              >
                <div className="w-[50px] h-[70px] rounded-xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center text-2xl flex-shrink-0">
                  📖
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-ink m-0">{b.titulo}</p>
                  <p className="text-sm text-inkSoft mt-0.5 mb-2">{b.autor}</p>
                  <ProgressBar
                    value={b.paginas_totales ? (b.pagina_actual / b.paginas_totales) * 100 : 0}
                    colorClass="bg-lavender"
                    trackClass="bg-lavenderSoft"
                    height={6}
                  />
                </div>
                <ChevronRight size={18} color="#A893C2" />
              </Card>
            ))}
          </div>
        )}
      </div>

      <SectionTitle icon={<Sparkles size={18} color="#C9B6E8" />}>Colecciones</SectionTitle>
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        <div className="min-w-[130px] bg-white border-2 border-dashed border-lavenderSoft rounded-2xl p-3.5 text-center">
          <div className="text-2xl">➕</div>
          <p className="text-sm font-bold text-inkSoft mt-2 mb-0">Crear colección</p>
        </div>
      </div>

      <SectionTitle icon={<BarChart3 size={18} color="#C9B6E8" />}>Hábitos de lectura</SectionTitle>
      <div className="flex gap-3">
        <Card className="flex-1 text-center">
          <p className="font-display text-xl font-extrabold text-ink m-0">{libros.length}</p>
          <p className="text-[11.5px] text-inkSoft mt-1 mb-0">Libros en tu biblioteca</p>
        </Card>
        <Card className="flex-1 text-center">
          <p className="font-display text-xl font-extrabold text-ink m-0">
            {libros.filter((b) => b.estado === "leido").length}
          </p>
          <p className="text-[11.5px] text-inkSoft mt-1 mb-0">Libros terminados</p>
        </Card>
      </div>
    </div>
  );
}
