// Función serverless de Netlify.
// Se publica automáticamente en: /.netlify/functions/conversa
// Mantiene tu clave de la API de Gemini en secreto (nunca llega al navegador).
// Usa la capa gratuita de la API de Gemini (Google AI Studio).

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  try {
    const { systemPrompt, messages } = JSON.parse(event.body);

    // Gemini espera los mensajes con role "user" / "model" y el texto
    // dentro de "parts". Convertimos nuestro historial (user/assistant).
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || "";

    if (!text) {
      // Útil para depurar errores de la API (ej. clave inválida, límite excedido)
      console.log("Respuesta de Gemini sin texto:", JSON.stringify(data));
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text || "No pude generar una respuesta. Intenta de nuevo. 🌸" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al conectar con la IA." }),
    };
  }
};
