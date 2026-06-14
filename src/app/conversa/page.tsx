"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, ChevronRight, MoreHorizontal } from "lucide-react";
import { Card, Pill, EmptyState } from "@/components/ui";
import { useProfile } from "@/lib/ProfileContext";
import { VOICES, Voice } from "@/lib/voices";
import { supabase } from "@/lib/supabaseClient";

type Message = { from: "user" | "ai"; text: string };

export default function ConversaPage() {
  const router = useRouter();
  const { user, loading, addXp } = useProfile();
  const [voice, setVoice] = useState<Voice | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [panelView, setPanelView] = useState<"free" | "panel">("free");
  const [debatePicks, setDebatePicks] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // Si venimos de un fragmento seleccionado en el lector
  useEffect(() => {
    const fragment = sessionStorage.getItem("diva_chat_fragment");
    if (fragment) {
      setInput(`Sobre este fragmento: "${fragment}" — `);
      sessionStorage.removeItem("diva_chat_fragment");
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || !voice || sending) return;
    const newHistory: Message[] = [...messages, { from: "user", text }];
    setMessages(newHistory);
    setInput("");
    setSending(true);
    if (newHistory.length === 1) addXp(2);

    try {
      const res = await fetch("/.netlify/functions/conversa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: voice.system,
          messages: newHistory.map((m) => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      const reply = data.text || "Lo siento, no pude responder. Intenta de nuevo. 🌸";

      setMessages((m) => {
        const updated: Message[] = [...m, { from: "ai", text: reply }];
        if (updated.length === 10) addXp(20);
        else if (updated.length === 5) addXp(10);
        return updated;
      });

      // Guardar conversación en Supabase (se actualiza el registro de esta sesión)
      if (user) {
        const fullMessages = [...newHistory, { from: "ai", text: reply }];
        if (newHistory.length === 1) {
          const { data } = await supabase
            .from("conversaciones")
            .insert({
              usuaria_id: user.id,
              voz_id: voice.id,
              mensajes: fullMessages,
            })
            .select("id")
            .single();
          if (data) setConversationId(data.id);
        } else if (conversationId) {
          await supabase
            .from("conversaciones")
            .update({ mensajes: fullMessages })
            .eq("id", conversationId);
        }
      }
    } catch {
      setMessages((m) => [...m, { from: "ai", text: "Tuve un problema para responder. ¿Puedes intentar de nuevo? 🌷" }]);
    } finally {
      setSending(false);
    }
  };

  const toggleDebatePick = (id: string) => {
    if (debatePicks.includes(id)) setDebatePicks(debatePicks.filter((n) => n !== id));
    else if (debatePicks.length < 4) setDebatePicks([...debatePicks, id]);
  };

  if (loading) return <div className="p-6 text-center text-inkSoft">Cargando...</div>;

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* header */}
      <div className="px-[18px] pt-[18px] pb-3 flex items-center gap-2.5 border-b border-lavenderSoft">
        {voice ? (
          <>
            <button
              onClick={() => { setVoice(null); setMessages([]); setConversationId(null); }}
              className="border-none bg-transparent"
            >
              <ChevronLeft size={22} color="#5C4B73" />
            </button>
            <div className="w-[38px] h-[38px] rounded-full bg-lavenderSoft flex items-center justify-center text-lg">
              {voice.emoji}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-sm text-ink m-0">{voice.name}</p>
              <p className="text-[11px] text-inkSoft m-0">Conversación libre</p>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/")} className="border-none bg-transparent">
              <ChevronLeft size={22} color="#5C4B73" />
            </button>
            <div className="flex-1">
              <p className="font-display font-extrabold text-base text-ink m-0">Conversa con IA</p>
              <p className="text-[11.5px] text-inkSoft m-0">Todas las voces disponibles desde el día 1 ✨</p>
            </div>
          </>
        )}
      </div>

      {!voice && (
        <div className="flex-1 overflow-y-auto px-[18px] py-3.5 pb-6">
          <div className="flex gap-2 mb-3.5">
            <Pill active={panelView === "free"} onClick={() => setPanelView("free")}>
              Conversación libre
            </Pill>
            <Pill active={panelView === "panel"} onClick={() => setPanelView("panel")}>
              Panel de debate
            </Pill>
          </div>

          {panelView === "free" && (
            <div className="flex flex-col gap-2">
              {VOICES.map((v) => (
                <Card key={v.id} onClick={() => setVoice(v)} className="flex gap-3 items-center">
                  <div className="w-[42px] h-[42px] rounded-full bg-lavenderSoft flex items-center justify-center text-xl flex-shrink-0">
                    {v.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[13.5px] text-ink m-0">{v.name}</p>
                    <p className="text-[11.5px] text-inkSoft mt-0.5 mb-0">{v.desc}</p>
                  </div>
                  <ChevronRight size={16} color="#A893C2" />
                </Card>
              ))}
            </div>
          )}

          {panelView === "panel" && (
            <>
              <Card className="bg-gradient-to-br from-lavenderSoft to-pinkSoft mb-3">
                <p className="font-display font-extrabold text-[15px] text-ink m-0">
                  Panel de debate ✨{" "}
                  <span className="text-[11px] bg-gold text-white px-2 py-0.5 rounded-full ml-1.5">Premium</span>
                </p>
                <p className="text-[12.5px] text-inkSoft mt-1.5 mb-0 leading-relaxed">
                  Elige hasta 4 voces para que respondan juntas, en una mesa redonda, sobre el mismo fragmento.
                </p>
              </Card>
              <div className="flex flex-col gap-2">
                {VOICES.map((v) => (
                  <Card
                    key={v.id}
                    onClick={() => toggleDebatePick(v.id)}
                    className={`flex gap-3 items-center border-2 ${
                      debatePicks.includes(v.id) ? "border-lavender" : "border-transparent"
                    }`}
                  >
                    <div className="w-[42px] h-[42px] rounded-full bg-lavenderSoft flex items-center justify-center text-xl flex-shrink-0">
                      {v.emoji}
                    </div>
                    <p className="flex-1 font-extrabold text-[13.5px] text-ink m-0">{v.name}</p>
                    <div
                      className={`w-5 h-5 rounded-full border-2 border-lavender ${
                        debatePicks.includes(v.id) ? "bg-lavender" : "bg-transparent"
                      }`}
                    />
                  </Card>
                ))}
              </div>
              <button
                disabled={debatePicks.length < 2}
                className={`w-full mt-3.5 border-none rounded-2xl py-3.5 font-extrabold text-sm ${
                  debatePicks.length >= 2 ? "bg-lavender text-white" : "bg-lavenderSoft text-inkSoft"
                }`}
              >
                Iniciar mesa redonda ({debatePicks.length}/4)
              </button>
              <p className="text-[11px] text-inkSoft mt-2 text-center">
                🔧 El Panel de Debate con múltiples voces a la vez puede agregarse en una siguiente fase.
              </p>
            </>
          )}
        </div>
      )}

      {voice && (
        <>
          {voice.id === "autora" && (
            <div className="bg-pinkSoft px-[18px] py-2.5 text-[11px] text-inkSoft leading-relaxed">
              ✨ Esta conversación es una interpretación basada en la obra y pensamiento público de la autora. No representa a la persona real.
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-[18px] py-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <EmptyState
                emoji={voice.emoji}
                title={`Hola, soy tu ${voice.name}`}
                text={`${voice.desc} Escríbeme sobre cualquier libro, tema o idea que quieras explorar.`}
              />
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  m.from === "user"
                    ? "self-end bg-lavender text-white"
                    : "self-start bg-white text-ink shadow-[0_4px_14px_-8px_rgba(150,120,180,0.3)]"
                }`}
              >
                {m.text}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex gap-2 flex-wrap mt-1">
                {["¿Qué libro debería leer primero?", "Háblame de Virginia Woolf", "¿Qué es el feminismo literario?"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="border border-lavenderSoft bg-white rounded-full px-3 py-1.5 text-[11.5px] text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {sending && (
              <div className="self-start bg-white rounded-2xl px-4 py-2.5 shadow-[0_4px_14px_-8px_rgba(150,120,180,0.3)] flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-lavender"
                    style={{ animation: `divaBounce 1s ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-3.5 pt-2.5 pb-[18px] flex gap-2 items-center border-t border-lavenderSoft bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={sending ? "FlorIA está escribiendo..." : "Escribe tu pregunta..."}
              disabled={sending}
              className="flex-1 border border-lavenderSoft rounded-full px-4 py-2.5 text-[13.5px] outline-none text-ink disabled:bg-cream"
            />
            <button
              onClick={send}
              disabled={sending}
              className={`w-10 h-10 rounded-full border-none flex items-center justify-center flex-shrink-0 ${
                sending ? "bg-lavenderSoft" : "bg-lavender"
              }`}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
