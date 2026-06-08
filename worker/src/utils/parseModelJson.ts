function tryParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

export function parseModelJsonResponse<T>(raw: string): T | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const direct = tryParse<T>(trimmed);
  if (direct) {
    return direct;
  }

  const withoutFences = trimmed
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const fromFences = tryParse<T>(withoutFences);
  if (fromFences) {
    return fromFences;
  }

  const balanced = extractBalancedJsonObject(withoutFences);
  if (balanced) {
    const parsed = tryParse<T>(balanced);
    if (parsed) {
      return parsed;
    }
  }

  const questionsMatch = withoutFences.match(/\{[\s\S]*"questions"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
  if (questionsMatch) {
    return tryParse<T>(questionsMatch[0]);
  }

  return null;
}
