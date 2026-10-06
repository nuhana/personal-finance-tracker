import { AiRateLimitError, type AiProvider } from "../types";

// Groq exposes an OpenAI-compatible API, so plain fetch is enough.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const groqProvider: AiProvider = {
  name: "groq",

  isConfigured() {
    return Boolean(process.env.GROQ_API_KEY);
  },

  async generateJson({ prompt, schema }) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: { name: "response", schema },
        },
      }),
    });

    if (res.status === 429) {
      throw new AiRateLimitError("groq");
    }

    if (!res.ok) {
      throw new Error(`Groq request failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
  },
};
