import { OllamaQuestionFormat } from "../views/Tests";

export async function generateQuestions(title: string, description: string): Promise<OllamaQuestionFormat[]> {
  const prompt = `
    Создай тест на тему "${title}". Дополнительный контекст: "${description}".
    Верни результат СТРОГО в формате валидного JSON массива объектов, где каждый объект имеет структуру:
    [{"text": "Текст вопроса", "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"], "correctAnswer": "Правильный вариант"}]
    Сгенерируй 5 вопросов. Не пиши ничего, кроме JSON.
  `;

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3', // или любая другая модель (mistral, qwen и т.д.)
      prompt: prompt,
      stream: false,
      format: 'json' // Заставляем Ollama вернуть валидный JSON
    }),
  });

  if (!response.ok) throw new Error('Ollama connection failed');

  const data = await response.json();
  
  try {
    return JSON.parse(data.response);
  } catch (e) {
    throw new Error('Failed to parse AI response into JSON');
  }
}