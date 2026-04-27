import api from "@/api/axios";
import { QuestionItem } from "@/components/question-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuestionCategory, QuestionEditable, QuestionOptionsDb } from "@/types/question";
import type { AxiosResponse } from "axios";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export default function CreateQuestionsPage() {
  const { testId } = useParams<'testId'>();
  const [questions, setQuestions] = useState<QuestionEditable[]>([]);

  useEffect(() => {
    api.get<QuestionEditable[]>(`/tests/${testId}/questions/list`)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch(() => toast("Ошибка при получении вопросов"));
  }, [testId]);

  const updateQuestion = async (id: number, newValues: Partial<QuestionEditable>) => {
    if (newValues.category) {
      await api.patch<QuestionEditable, AxiosResponse<QuestionEditable>, { category: QuestionCategory }>(
        `/tests/${testId}/questions/${id}/change-category`,
        {
          category: newValues.category
        }
      )
        .then(({ data }) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q)))
        .catch(() => toast('Ошибка при смене категории'));
    }

    if (newValues.question) {
      await api.patch<QuestionEditable, AxiosResponse<QuestionEditable>, { question: string }>(
        `/tests/${testId}/questions/${id}/change-question`,
        {
          question: newValues.question
        }
      )
        .then(({ data }) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q)))
        .catch(() => toast(`Ошибка при смене текста вопроса`));
    }

    if (newValues.options) {
      await api.patch<QuestionEditable, AxiosResponse<QuestionEditable>, { options: QuestionOptionsDb }>(
        `/tests/${testId}/questions/${id}/change-options`,
        {
          options: newValues.options
        }
      )
        .then(({ data }) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q)))
        .catch(() => toast(`Ошибка при смене опции`));
    }

    if (newValues.standardAnswer) {
      await api.patch<QuestionEditable, AxiosResponse<QuestionEditable>, { standardAnswer: string }>(
        `/tests/${testId}/questions/${id}/change-standard-answer`,
        {
          standardAnswer: newValues.standardAnswer
        }
      )
        .then(({ data }) => setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q)))
        .catch(() => toast(`Ошибка при смене эталонного ответа`));
    }
  };

  return (
    <div>
      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle>Информация</AlertTitle>
        <AlertDescription className="inline">
          Отображаются вопросы, включенные в тест. Вопросы категории <span className="font-bold text-orange-600">В</span> могут быть отредактированы.
        </AlertDescription>
      </Alert>
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          order={question.order}
          question={question}
          onUpdate={updateQuestion}
        />
      ))}
    </div>
  );
};
