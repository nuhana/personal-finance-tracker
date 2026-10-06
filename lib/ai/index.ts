import { geminiProvider } from "./providers/gemini";
import { groqProvider } from "./providers/groq";
import { AiRateLimitError, type AiProvider, type StructuredRequest } from "./types";

export { AiRateLimitError } from "./types";

// To add a provider (OpenAI, Claude, ...), implement AiProvider in
// ./providers and register it here.
const providers: Record<string, AiProvider> = {
  gemini: geminiProvider,
  groq: groqProvider,
};

// Tried in this order; override with e.g. AI_PROVIDERS="groq,gemini".
function providerOrder(): AiProvider[] {
  const names = (process.env.AI_PROVIDERS ?? "gemini,groq")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  return names
    .map((name) => providers[name])
    .filter((p): p is AiProvider => p !== undefined && p.isConfigured());
}

// Tries each configured provider in turn, moving on when one is rate
// limited or fails. Throws AiRateLimitError only if every provider that
// was tried hit its rate limit.
export async function generateJson(
  request: StructuredRequest
): Promise<Record<string, unknown>> {
  const order = providerOrder();

  if (order.length === 0) {
    throw new Error("No AI provider is configured");
  }

  let lastError: unknown;
  let allRateLimited = true;

  for (const provider of order) {
    try {
      const result = await provider.generateJson(request);
      // A reply like `null` or `"text"` is a failed answer, not a valid one,
      // so treat it as an error and try the next provider.
      if (typeof result !== "object" || result === null || Array.isArray(result)) {
        throw new Error(`Expected a JSON object, got ${JSON.stringify(result)}`);
      }
      return result as Record<string, unknown>;
    } catch (error) {
      console.warn(`AI provider "${provider.name}" failed:`, error);
      lastError = error;
      if (!(error instanceof AiRateLimitError)) allRateLimited = false;
    }
  }

  throw allRateLimited ? lastError : new Error("All AI providers failed", { cause: lastError });
}
