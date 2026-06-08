import { CheckCircle2, Circle, ListOrdered } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Импортируем Tabs
import { cn } from "@/lib/utils";
import { getTypeByCode, type ChoiceOptionsDb, type MatchingOptionsDb, type QuestionCategory, type QuestionEditable, type SequenceOptionsDb } from '@/types/question';

interface QuestionItemProps {
  question: QuestionEditable;
  onUpdate?: (id: number, category: Partial<QuestionEditable>) => void;
  order: number;
  readonly?: boolean;
}

const borderColors: Record<QuestionCategory, string> = {
  "A": 'border-l-green-500',
  "B": 'border-l-orange-500',
  "C": 'border-l-red-500'
};

export const QuestionItem = ({ question, onUpdate, order, readonly = false }: QuestionItemProps) => {
  const borderColor = borderColors[question.category] || borderColors['C'];
  const { typeLabel, subtypeLabel } = getTypeByCode(question.type, question.subtype);
  const isReadonlyOrBestCategory = readonly || question.category === "A";

  const renderChoiceOptions = (options: ChoiceOptionsDb) => (
    <ul className="space-y-2">
      {options.map((option, index) => (
        <li
          key={index}
          className={cn(
            "flex items-center gap-3 p-2 rounded-sm transition-colors border border-transparent",
            option.isTrue ? "bg-green-500/10 border-green-200 text-green-700 dark:text-green-400" : "bg-transparent"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {option.isTrue ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Circle className="w-4 h-4 text-muted-foreground/50" />}
          </div>
          <div className={cn("text-sm flex-1", option.isTrue && "font-bold")}>
            {isReadonlyOrBestCategory ? (
              <span>[{index + 1}] {option.text}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground/70">[{index + 1}]</span>
                <input
                  type="text"
                  className={cn(
                    "flex-1 bg-transparent outline-none border-b border-transparent focus:border-primary/50 px-1 py-0.5 transition-colors",
                    option.isTrue ? "font-bold text-green-800 dark:text-green-300" : "hover:border-border"
                  )}
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = { ...newOptions[index], text: e.target.value };
                    onUpdate?.(question.id, { options: newOptions });
                  }}
                  placeholder={`Вариант ${index + 1}`}
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  // Рендер сопоставления (Matching)
  const renderMatchingOptions = (options: MatchingOptionsDb) => (
    <div className="grid grid-cols-2 gap-4">
      {/* Левая колонка */}
      <div>
        <h5 className="text-xs font-semibold text-muted-foreground mb-2">Левая колонка:</h5>
        <ul className="space-y-2">
          {options.left?.map((item, index) => (
            <li key={`left-${index}`} className="text-sm flex items-center gap-2">
              {/* Выводим ID (например, "1") */}
              <span className="font-bold text-muted-foreground min-w-[1.5rem]">
                {item.id}.
              </span>

              {isReadonlyOrBestCategory ? (
                <div className="bg-background border p-2 rounded w-full">
                  {item.text}
                </div>
              ) : (
                <div className="bg-background border p-2 rounded w-full">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={item.text}
                    onChange={(e) => {
                      // Копируем массивы, чтобы не мутировать стейт напрямую
                      const newOptions = { ...options, left: [...(options.left || [])] };
                      newOptions.left[index] = { ...newOptions.left[index], text: e.target.value };
                      onUpdate?.(question.id, { options: newOptions });
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Правая колонка */}
      <div>
        <h5 className="text-xs font-semibold text-muted-foreground mb-2">Правая колонка:</h5>
        <ul className="space-y-2">
          {options.right?.map((item, index) => (
            <li key={`right-${index}`} className="text-sm flex items-center gap-2">
              {/* Выводим ID (например, "А") */}
              <span className="font-bold text-muted-foreground min-w-[1.5rem]">
                {item.id})
              </span>

              {isReadonlyOrBestCategory ? (
                <div className="bg-background border p-2 rounded w-full">
                  {item.text}
                </div>
              ) : (
                <div className="bg-background border p-2 rounded w-full">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={item.text}
                    onChange={(e) => {
                      const newOptions = { ...options, right: [...(options.right || [])] };
                      newOptions.right[index] = { ...newOptions.right[index], text: e.target.value };
                      onUpdate?.(question.id, { options: newOptions });
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Рендер правильной последовательности (Correct Sequence)
  const renderSequenceOptions = (options: SequenceOptionsDb) => (
    <ul className="space-y-2">
      {options.map((item, index) => (
        <li key={`seq-${index}`} className="flex items-center gap-3 text-sm p-2 bg-background border rounded">
          <ListOrdered className="w-4 h-4 text-muted-foreground" />

          {/* Отображаем ID, чтобы было понятно, из чего строится правильный ответ */}
          <span className="font-mono text-muted-foreground border-r pr-3 my-1">
            [{item.id}]
          </span>

          {isReadonlyOrBestCategory ? (
            <span className="flex-1">{item.text}</span>
          ) : (
            <input
              className="flex-1 bg-transparent outline-none pl-1"
              value={item.text}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = { ...newOptions[index], text: e.target.value };
                onUpdate?.(question.id, { options: newOptions });
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );

  // Диспетчер рендера опций
  const renderOptionsArea = () => {
    if (!question.options && question.type === "Open") {
      return null;
    }

    return (
      <div className="rounded-md border p-3 bg-muted/30">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          Структура ответа (Опции):
        </h4>

        {question.subtype === "One" || question.subtype === "Multiple" ? renderChoiceOptions(question.options as ChoiceOptionsDb)
          : question.subtype === "Matching" ? renderMatchingOptions(question.options as MatchingOptionsDb)
            : question.subtype === "CorrectSequence" ? renderSequenceOptions(question.options as SequenceOptionsDb)
              : null
        }
      </div>
    );
  };

  // Диспетчер рендера эталонного ответа
  const renderStandardAnswerArea = () => {
    const choiceOptions =
      question.subtype === 'One' || question.subtype === 'Multiple'
        ? (question.options as ChoiceOptionsDb | undefined)
        : undefined;
    const hasMarkedCorrectChoice = choiceOptions?.some((option) => option.isTrue) ?? false;

    if (
      (question.subtype === 'One' || question.subtype === 'Multiple') &&
      hasMarkedCorrectChoice
    ) {
      return null;
    }

    let displayAnswer = question.standardAnswer || '';

    if (isReadonlyOrBestCategory && question.standardAnswer && (question.subtype === "Matching" || question.subtype === "CorrectSequence")) {
      try {
        const parsed = JSON.parse(question.standardAnswer);
        if (question.subtype === "CorrectSequence" && Array.isArray(parsed)) {
          displayAnswer = parsed.join(" ➔ ");
        } else if (question.subtype === "Matching" && typeof parsed === "object") {
          displayAnswer = Object.entries(parsed).map(([k, v]) => `${k} — ${v}`).join("\n");
        }
      } catch (e) {
        console.error(e);
      }
    }

    return (
      <div className="rounded-md border p-3 bg-muted/30">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          ✅ Эталонный ответ:
        </h4>
        {isReadonlyOrBestCategory ? (
          <div className="whitespace-pre-wrap text-sm text-foreground bg-background p-2 border rounded">
            {displayAnswer}
          </div>
        ) : (
          <textarea
            className="w-full min-h-[60px] p-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            value={question.standardAnswer || ''}
            onChange={(e) => onUpdate?.(question.id, { standardAnswer: e.target.value })}
            placeholder={question.subtype === "Matching" || question.subtype === "CorrectSequence" ? "Введите JSON..." : "Введите эталонный ответ..."}
          />
        )}
      </div>
    );
  };

  return (
    <Card className={cn("mb-6 border-l-4 transition-all duration-200 gap-0", borderColor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Вопрос #{order}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase">Категория:</span>
          <Tabs
            value={question.category}
            onValueChange={(value) => readonly ? null : onUpdate?.(question.id, { category: value as QuestionCategory })}
            className={cn(readonly && "pointer-events-none opacity-90")}
          >
            <TabsList className="grid w-full grid-cols-3 h-8 p-1">
              <TabsTrigger value="A" className="text-xs px-3 data-[state=active]:bg-green-500 data-[state=active]:text-white">A</TabsTrigger>
              <TabsTrigger value="B" className="text-xs px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">B</TabsTrigger>
              <TabsTrigger value="C" className="text-xs px-3 data-[state=active]:bg-red-500 data-[state=active]:text-white">C</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-secondary/20 p-3 rounded-lg flex flex-col gap-2">
          <span className="font-bold text-foreground">Текст вопроса:</span>
          {isReadonlyOrBestCategory ? (
            <p className="text-base text-foreground whitespace-pre-wrap">{question.question}</p>
          ) : (
            <textarea
              className="w-full min-h-[80px] p-2 text-base bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              value={question.question}
              onChange={(e) => onUpdate?.(question.id, { question: e.target.value })}
              placeholder="Введите текст вопроса..."
            />
          )}
        </div>

        {renderOptionsArea()}

        {renderStandardAnswerArea()}

        {/* Футер */}
        <div className="pt-2 border-t border-dashed flex justify-between items-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Тип/Подтип: <span className="font-medium text-foreground">{typeLabel} / {subtypeLabel}</span>
          </p>
          <div className={cn(
            "text-[10px] px-2 py-0.5 rounded-full border font-bold",
            question.category === "A" && "text-green-600 border-green-600",
            question.category === "B" && "text-orange-600 border-orange-600",
            question.category === "C" && "text-red-600 border-red-600",
          )}>
            Категория {question.category}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
