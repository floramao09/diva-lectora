"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre: nombre || "Nueva Lectora" } },
      });
      if (error) setError(error.message);
      else router.push("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-br from-lavenderSoft to-pinkSoft">
      <div className="text-5xl mb-2">📖✨</div>
      <h1 className="font-display text-3xl font-extrabold text-ink mb-1">Diva Lectora</h1>
      <p className="text-sm text-inkSoft mb-8">Lee. Sueña. Conversa. Crece.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full font-bold text-sm ${
              mode === "login" ? "bg-lavender text-white" : "bg-lavenderSoft text-ink"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full font-bold text-sm ${
              mode === "signup" ? "bg-lavender text-white" : "bg-lavenderSoft text-ink"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {mode === "signup" && (
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-lavenderSoft rounded-xl px-4 py-3 mb-3 text-sm outline-none"
          />
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-lavenderSoft rounded-xl px-4 py-3 mb-3 text-sm outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-lavenderSoft rounded-xl px-4 py-3 mb-3 text-sm outline-none"
        />

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lavender text-white font-extrabold text-sm py-3 rounded-full shadow-md disabled:opacity-60"
        >
          {loading ? "Un momento..." : mode === "login" ? "Entrar" : "Crear mi cuenta"}
        </button>
      </form>

      <p className="text-xs text-inkSoft mt-6 text-center max-w-sm">
        Al continuar, tu progreso de lectura, XP y biblioteca se guardarán de forma segura en tu cuenta. 🌷
      </p>
    </div>
  );
}
