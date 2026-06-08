import api from "@/api/axios";
import { QuestionItem } from "@/components/question-item";
import { QuestionSkeletonItem } from "@/components/question-skeleton-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuestionCategory, QuestionEditable, QuestionOptionsDb } from "@/types/question";
import { isQuestionFailed, isQuestionPending } from "@/types/question";
import type { AxiosResponse } from "axios";
import { Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 3000;

export default function CreateQuestionsPage() {
  const { testId } = useParams<'testId'>();
  const [questions, setQuestions] = useState<QuestionEditable[]>([]);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuestions = useCallback(async () => {
    const res = await api.get<QuestionEditable[]>(`/tests/${testId}/questions/list`);
    setQuestions(res.data);
    return res.data;
  }, [testId]);

  useEffect(() => {
    fetchQuestions().catch(() => toast("Ошибка при получении вопросов"));
  }, [fetchQuestions]);

  useEffect(() => {
    const hasPending = questions.some(isQuestionPending);

    if (hasPending && !pollTimerRef.current) {
      pollTimerRef.current = setInterval(() => {
        fetchQuestions().catch(() => {});
      }, POLL_INTERVAL_MS);
    }

    if (!hasPending && pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [questions, fetchQuestions]);

  const updateQuestion = async (id: number, newValues: Partial<QuestionEditable>) => {
    const current = questions.find((q) => q.id === id);
    if (current && (isQuestionPending(current) || isQuestionFailed(current))) {
      return;
    }

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

  const pendingCount = questions.filter(isQuestionPending).length;

  return (
    <div>
      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle>Информация</AlertTitle>
        <AlertDescription className="inline">
          Отображаются вопросы, включенные в тест. Вопросы категории <span className="font-bold text-orange-600">В</span> могут быть отредактированы.
          {pendingCount > 0 && (
            <span className="block mt-1 text-blue-700">
              Генерируется {pendingCount} {pendingCount === 1 ? 'вопрос' : pendingCount < 5 ? 'вопроса' : 'вопросов'} — страница обновляется автоматически.
            </span>
          )}
        </AlertDescription>
      </Alert>
      {questions.map((question, index) => {
        if (isQuestionPending(question) || isQuestionFailed(question)) {
          return (
            <QuestionSkeletonItem
              key={question.id}
              order={question.order ?? index + 1}
              question={question}
            />
          );
        }

        return (
          <QuestionItem
            key={question.id}
            order={question.order ?? index + 1}
            question={question}
            onUpdate={updateQuestion}
          />
        );
      })}
    </div>
  );
};
