function envNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a number, got "${value}"`);
  }

  return parsed;
}

function envBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  return value === '1' || value.toLowerCase() === 'true';
}

export type OllamaGenerationOptions = {
  temperature: number;
  top_k: number;
  top_p: number;
  repeat_penalty: number;
  num_predict: number;
  seed?: number;
};

export const ollamaConfig = {
  apiUrl: process.env.OLLAMA_API_URL ?? 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL ?? 'hodza/cotype-nano-1.5-unofficial',
  modelBatchSize: envNumber('OLLAMA_MODEL_BATCH_SIZE', 1),
  minGenerationAttempts: envNumber('OLLAMA_MIN_GENERATION_ATTEMPTS', 5),
  maxRetriesMultiplier: envNumber('OLLAMA_MAX_RETRIES_MULTIPLIER', 5),
  requestTimeoutMs: envNumber('OLLAMA_REQUEST_TIMEOUT_MS', 180_000),
  useRandomSeed: envBoolean('OLLAMA_USE_RANDOM_SEED', true),
  fixedSeed: envNumber('OLLAMA_SEED', 0),
  generationOptions: {
    temperature: envNumber('OLLAMA_TEMPERATURE', 0),
    top_k: envNumber('OLLAMA_TOP_K', 40),
    top_p: envNumber('OLLAMA_TOP_P', 0.9),
    repeat_penalty: envNumber('OLLAMA_REPEAT_PENALTY', 1.15),
    num_predict: envNumber('OLLAMA_NUM_PREDICT', 4096),
  } satisfies Omit<OllamaGenerationOptions, 'seed'>,
};

export function buildOllamaRequestOptions(): OllamaGenerationOptions {
  const seed = ollamaConfig.useRandomSeed
    ? Math.floor(Math.random() * 1_000_000)
    : ollamaConfig.fixedSeed;

  return {
    ...ollamaConfig.generationOptions,
    seed,
  };
}
