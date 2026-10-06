import { GoogleGenAI } from "@google/genai";
import { AiRateLimitError, type AiProvider } from "../types";

let client: GoogleGenAI | null = null;

export const geminiProvider: AiProvider = {
  name: "gemini",

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async generateJson({ prompt, schema }) {
    client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const interaction = await client.interactions.create({
        model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
        input: prompt,
        // Picking from a short list needs little reasoning. gemini-3.8-flash
        // rejects "minimal", so "low" is the lowest level it accepts.
        generation_config: { thinking_level: "low" },
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema,
        },
      });

      return JSON.parse(interaction.output_text ?? "{}");
    } catch (error) {
      if ((error as { status?: number })?.status === 429) {
        throw new AiRateLimitError("gemini");
      }
      throw error;
    }
  },
};
