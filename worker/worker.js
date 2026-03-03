export default {
  async fetch(req, env) {
    // CORS (tighten origin to your domain when ready)
    const allowedOrigin = "https://yourusername.github.io";

    if (req.headers.get("origin") !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response("", { headers: cors });

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    try {
      const { userText, pageContext, catKnowledge } = await req.json();

      const instructions = `
You are Cat EmporiumGPT, a helpful assistant for a website.
You can answer questions about HTML/CSS/JS, and the current page using the provided context.
Rules:
- Be concise.
- Do not invent page elements not present in context.
- If you suggest code, give minimal diffs and where to put them.
      `.trim();

      const input = {
        userText: String(userText || ""),
        pageContext: pageContext || {},
        catKnowledge: catKnowledge || {},
      };

      // OpenAI Responses API (recommended for new projects)
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5",
          instructions,
          input: JSON.stringify(input),
        }),
      });

      if (!r.ok) {
        return new Response(JSON.stringify({ reply: "AI backend error." }), {
          status: 500,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      const data = await r.json();
      return new Response(JSON.stringify({ reply: data.output_text || "" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ reply: "AI is unavailable right now." }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};