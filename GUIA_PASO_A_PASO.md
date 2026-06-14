# Diva Lectora — Guía paso a paso para publicar tu app

Esta guía está pensada para alguien que **nunca ha programado**. Todo se hace desde el navegador web: no necesitas instalar nada en tu computadora.

Vas a usar 3 servicios, todos con planes gratuitos para empezar:

1. **GitHub** → donde vive el código de tu app
2. **Supabase** → guarda las cuentas de usuarias, su progreso y los libros EPUB
3. **Netlify** → publica tu app en internet (te da un link real)

Sigue los pasos en orden. No te saltes ninguno.

---

## PARTE 1 — Subir el código a GitHub

### Paso 1.1 — Descomprime la carpeta

Descomprime el archivo `diva-lectora.zip` que te entregué. Verás una carpeta llamada `diva-app` con muchos archivos y carpetas dentro.

### Paso 1.2 — Crea un repositorio nuevo en GitHub

1. Entra a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón verde **"New"** (o el ícono "+" arriba a la derecha → "New repository")
3. Ponle de nombre: `diva-lectora`
4. Déjalo en **Privado** (Private) si quieres que nadie más vea tu código
5. NO marques ninguna casilla de "Add README" ni ".gitignore" (ya viene incluido)
6. Haz clic en **"Create repository"**

### Paso 1.3 — Sube los archivos

GitHub te mostrará una página con varias opciones. Busca el enlace que dice algo como **"uploading an existing file"**.

1. Haz clic ahí
2. Verás una zona para arrastrar archivos
3. Abre la carpeta `diva-app` que descomprimiste, **selecciona TODO su contenido** (todas las carpetas y archivos que están DENTRO de `diva-app`, no la carpeta misma) y arrástralos a la zona de GitHub

> ⚠️ Importante: arrastra el CONTENIDO de la carpeta `diva-app`, no la carpeta `diva-app` completa. Es decir, deberías ver subir cosas como `src`, `package.json`, `netlify.toml`, etc., directamente en la raíz del repositorio.

4. Espera a que termine de subir todo (puede tardar unos minutos)
5. Abajo, donde dice "Commit changes", déjalo como está
6. Haz clic en **"Commit changes"**

✅ Listo, tu código ya está en GitHub.

---

## PARTE 2 — Configurar Supabase (cuentas y base de datos)

### Paso 2.1 — Crea un proyecto

1. Entra a [supabase.com](https://supabase.com) e inicia sesión (o crea cuenta, es gratis)
2. Haz clic en **"New project"**
3. Ponle un nombre, por ejemplo `diva-lectora`
4. Elige una contraseña para la base de datos (guárdala en un lugar seguro, no la necesitarás de nuevo normalmente)
5. Elige la región más cercana a tus usuarias
6. Haz clic en **"Create new project"** y espera 1-2 minutos mientras se crea

### Paso 2.2 — Crea las tablas (base de datos)

1. En el menú de la izquierda, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**
3. Abre el archivo `supabase_schema.sql` (está dentro de la carpeta que descomprimiste) con cualquier editor de texto (o el Bloc de Notas)
4. Copia TODO su contenido
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **"Run"** (o el botón ▶️)

Deberías ver un mensaje de éxito. Esto creó todas las tablas necesarias (usuarias, libros, notas, conversaciones, etc.) y configuró la seguridad para que cada usuaria solo vea sus propios datos.

### Paso 2.3 — Verifica el almacenamiento de archivos EPUB

1. En el menú izquierdo, haz clic en **"Storage"**
2. Deberías ver un bucket llamado **"epubs"** (se creó automáticamente con el script anterior)
3. Si no aparece, créalo manualmente: clic en "New bucket" → nombre `epubs` → déjalo como **privado** (no marcado como público) → crear

### Paso 2.4 — Copia tus claves de API

1. En el menú izquierdo, haz clic en el ícono de engranaje **"Project Settings"**
2. Luego en **"API"**
3. Verás dos valores que vas a necesitar pronto (déjalos abiertos en una pestaña o cópialos a un documento):
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (una cadena larga de letras y números)

Guarda estos dos valores, los usarás en la Parte 4.

---

## PARTE 3 — Obtener tu clave de la API de Gemini (Google) — GRATIS

Esto es lo que hace que "Conversa IA" funcione de verdad, usando la capa gratuita de Gemini.

1. Entra a [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API key"** (Crear clave de API)
4. Copia la clave que te muestra (una cadena de letras y números) y guárdala

> 💡 La capa gratuita de Gemini tiene límites de uso (por ejemplo, cierta cantidad de mensajes por minuto/día), pero para uso personal normalmente es suficiente y **no debería generarte ningún cobro**. No necesitas agregar tarjeta de crédito para obtener esta clave gratuita.

---

## PARTE 4 — Publicar en Netlify

### Paso 4.1 — Conecta tu repositorio

1. Entra a [netlify.com](https://netlify.com) e inicia sesión
2. Haz clic en **"Add new site"** → **"Import an existing project"**
3. Elige **"Deploy with GitHub"** y autoriza el acceso si te lo pide
4. Busca y selecciona el repositorio `diva-lectora` que subiste en la Parte 1

### Paso 4.2 — Configuración de build

Netlify debería detectar automáticamente que es un proyecto Next.js gracias al archivo `netlify.toml` que incluimos. Verás algo como:

- Build command: `npm run build`
- Publish directory: (lo gestiona el plugin automáticamente)

No cambies nada, solo continúa.

### Paso 4.3 — Agrega las variables de entorno (tus claves secretas)

Antes de hacer clic en "Deploy", busca la sección **"Environment variables"** (o ve después a: Site settings → Environment variables → Add a variable).

Agrega estas 3 variables, una por una:

| Nombre de la variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | El "Project URL" que copiaste de Supabase (Parte 2.4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La "anon public key" que copiaste de Supabase (Parte 2.4) |
| `GEMINI_API_KEY` | La clave gratuita que copiaste de Google AI Studio (Parte 3) |

> ⚠️ Muy importante: `GEMINI_API_KEY` debe escribirse EXACTAMENTE así, sin "NEXT_PUBLIC_" al principio. Esto la mantiene secreta y segura.

### Paso 4.4 — Publica

1. Haz clic en **"Deploy site"**
2. Espera unos minutos mientras Netlify construye tu app (verás un registro de progreso)
3. Cuando termine, Netlify te dará un link como `https://nombre-aleatorio.netlify.app`

✅ ¡Tu app ya está publicada y cualquiera con el link puede usarla!

---

## PARTE 5 — Pruébala

1. Abre el link que te dio Netlify
2. Deberías ver la pantalla de inicio de sesión de Diva Lectora
3. Crea una cuenta de prueba
4. Verifica que:
   - Puedes entrar a Inicio y ver tu nivel 1 "Lectora Curiosa"
   - En Biblioteca puedes subir un archivo `.epub` (cualquier libro EPUB que tengas)
   - Al abrir el libro, el lector muestra el contenido
   - En Conversa, eliges una voz y le escribes algo — debería responder de verdad (esto usa tu clave de Gemini)
   - Al subrayar o crear una nota, ganas XP

---

## PARTE 6 — Cómo hacer cambios después

Cada vez que quieras cambiar algo del código (con ayuda de Claude, por ejemplo):

1. Pide los archivos actualizados
2. En GitHub, ve a tu repositorio → navega a la carpeta del archivo que cambió
3. Haz clic en el archivo → ícono de lápiz (editar) → pega el nuevo contenido → "Commit changes"
4. Netlify detecta el cambio automáticamente y vuelve a publicar tu app en 1-2 minutos

---

## Solución de problemas comunes

**La app se queda en "Cargando Diva Lectora..."**
→ Revisa que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén bien copiadas en Netlify (sin espacios extra).

**Conversa IA no responde / da error**
→ Revisa que `GEMINI_API_KEY` esté configurada en Netlify y que sea una clave válida de Google AI Studio.

**No puedo subir el EPUB**
→ Verifica en Supabase → Storage que el bucket `epubs` existe y que corriste el script SQL completo (incluye las políticas de seguridad del bucket).

**Hice un cambio en GitHub pero la app no cambió**
→ Ve a Netlify → tu sitio → pestaña "Deploys" y revisa si hay un deploy en progreso o si falló (haz clic para ver el error).

---

## Resumen de los 3 servicios

| Servicio | Para qué sirve | Costo |
|---|---|---|
| GitHub | Guarda el código | Gratis |
| Supabase | Cuentas, base de datos, archivos EPUB | Gratis para empezar |
| Netlify | Publica la app con un link real | Gratis para empezar |
| Google Gemini | Hace que Conversa IA responda | Gratis (capa gratuita, sin tarjeta) |

🌸 ¡Felicidades! Si llegaste hasta aquí, tienes tu propia app publicada y funcionando.
