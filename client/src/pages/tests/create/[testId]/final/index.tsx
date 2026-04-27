import { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QuestionEditable } from '@/types/question';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { toast } from 'sonner';
import { QuestionItem } from '@/components/question-item';

export default function CreateFinalPage() {
  const { testId } = useParams<'testId'>();
  const [questions, setQuestions] = useState<QuestionEditable[]>([]);

  useEffect(() => {
    api.get<QuestionEditable[]>(`/tests/${testId}/questions/list`)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch(() => toast("Ошибка при получении вопросов"));
  }, [testId]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => q.category === "A");
  }, [questions]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {filteredQuestions.length === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Пусто</AlertTitle>
          <AlertDescription>Нет вопросов, включенных в итоговый тест.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              order={index + 1}
              readonly
            />
          ))}
        </div>
      )}
    </div>
  );
};
