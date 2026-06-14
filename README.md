# Diva Lectora

App de lectura kawaii con IA, gamificación y comunidad.

## 🚀 Empezar

**¿Nunca has programado?** Abre `GUIA_PASO_A_PASO.md` y sigue las instrucciones — está hecha para publicar esta app en Netlify sin instalar nada en tu computadora.

## 🛠️ Stack

- Next.js 14 (React + TypeScript)
- Tailwind CSS
- Supabase (autenticación, base de datos, almacenamiento de archivos)
- epub.js (lector EPUB)
- API de Gemini / Google AI Studio (Conversa IA, capa gratuita)
- Netlify (hosting + funciones serverless)

## 📁 Archivos clave

- `supabase_schema.sql` → ejecútalo en el SQL Editor de Supabase para crear todas las tablas
- `netlify/functions/conversa.js` → función serverless que conecta con la API de Gemini
- `src/lib/levels.ts` → sistema de 50 niveles y valores de XP
- `src/lib/voices.ts` → las 8 voces de Conversa IA con sus personalidades
- `.env.example` → variables de entorno necesarias (configúralas en Netlify, no en este archivo)

## 📦 Módulos incluidos

Inicio · Biblioteca · Lector EPUB · Conversa IA · Retos · Niveles y XP · Viaja por el mundo · Logros y colecciones · Estadísticas · Comunidad
