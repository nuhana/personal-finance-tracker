export type JsonSchema = Record<string, unknown>;

export type StructuredRequest = {
  prompt: string;
  // JSON Schema the response must follow.
  schema: JsonSchema;
};

export interface AiProvider {
  name: string;
  // False when the provider's API key is missing, so it is skipped.
  isConfigured(): boolean;
  // Returns the parsed JSON response; callers must still validate it.
  generateJson(request: StructuredRequest): Promise<unknown>;
}

export class AiRateLimitError extends Error {
  constructor(provider: string) {
    super(`${provider} rate limit reached`);
    this.name = "AiRateLimitError";
  }
}
