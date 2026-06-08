function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeLower(value: string): string {
  return normalize(value).toLowerCase();
}

function findOptionIndex(options: string[], answer: string): number {
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) {
    return -1;
  }

  const exactIndex = options.findIndex((opt) => normalize(opt) === normalizedAnswer);
  if (exactIndex >= 0) {
    return exactIndex;
  }

  const caseInsensitiveIndex = options.findIndex(
    (opt) => normalizeLower(opt) === normalizeLower(normalizedAnswer)
  );
  if (caseInsensitiveIndex >= 0) {
    return caseInsensitiveIndex;
  }

  return options.findIndex((opt) => {
    const normalizedOption = normalizeLower(opt);
    const answerLower = normalizeLower(normalizedAnswer);
    return (
      normalizedOption.includes(answerLower) ||
      answerLower.includes(normalizedOption)
    );
  });
}

export function reconcileOneChoice(
  options: string[],
  correctAnswer: string | undefined
): { options: string[]; correctIndex: number; standardAnswer: string | null } {
  const sourceOptions = [...(options ?? [])];
  const answer = correctAnswer?.trim() ?? '';

  if (!answer) {
    return {
      options: sourceOptions,
      correctIndex: -1,
      standardAnswer: null,
    };
  }

  let correctIndex = findOptionIndex(sourceOptions, answer);

  if (correctIndex === -1 && sourceOptions.length > 0) {
    sourceOptions[sourceOptions.length - 1] = answer;
    correctIndex = sourceOptions.length - 1;
    console.warn(
      `correct_answer не совпал ни с одним option, подставлен в последний вариант: "${answer}"`
    );
  }

  const standardAnswer = correctIndex >= 0 ? normalize(sourceOptions[correctIndex]) : answer;

  return {
    options: sourceOptions,
    correctIndex,
    standardAnswer,
  };
}

export function reconcileMultipleChoice(
  options: string[],
  correctAnswers: string[] | undefined
): { options: string[]; correctIndices: Set<number>; standardAnswer: string | null } {
  const sourceOptions = [...(options ?? [])];
  const answers = (correctAnswers ?? []).map(normalize).filter(Boolean);
  const correctIndices = new Set<number>();
  const matchedAnswers: string[] = [];

  for (const answer of answers) {
    let index = findOptionIndex(sourceOptions, answer);

    if (index === -1 && sourceOptions.length > 0) {
      const freeIndex = sourceOptions.findIndex((_, i) => !correctIndices.has(i));
      if (freeIndex >= 0) {
        sourceOptions[freeIndex] = answer;
        index = freeIndex;
        console.warn(
          `correct_answers: "${answer}" не найден в options, подставлен в вариант ${freeIndex + 1}`
        );
      }
    }

    if (index >= 0) {
      correctIndices.add(index);
      matchedAnswers.push(normalize(sourceOptions[index]));
    }
  }

  return {
    options: sourceOptions,
    correctIndices,
    standardAnswer: matchedAnswers.length > 0 ? JSON.stringify(matchedAnswers) : null,
  };
}
