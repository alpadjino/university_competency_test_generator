import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Upload, FileText, Wand2, Plus, X, Loader2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import mammoth from 'mammoth';
import api from '@/api/axios';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { QuestionType, OpenQuestionSubtype, ClosedQuestionSubtype } from '@/types/question';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SUBTYPE_OPTIONS: Record<QuestionType, Array<{ id: OpenQuestionSubtype | ClosedQuestionSubtype, label: string, desc: string }>> = {
  Closed: [
    { id: 'One', label: "Один ответ", desc: "Выбор одного верного варианта" },
    { id: "Multiple", label: "Множественный выбор", desc: "Несколько правильных ответов" },
    { id: "Matching", label: "Соответствие", desc: "Установление связей" },
    { id: "CorrectSequence", label: "Правильный порядок", desc: "Выставить правильный порядок" },
  ],
  Open: [
    { id: "Addition", label: "Краткий", desc: "Ответ в одно-два слова" },
    { id: "DetailedAnswer", label: "Развернутый", desc: "Подробное объяснение" },
  ]
};

export default function UploadDocsPage() {
  const { testId } = useParams<'testId'>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState({ text: "", x: 0, y: 0, visible: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [questionCount, setQuestionCount] = useState(1);
  const [questionType, setQuestionType] = useState<QuestionType>("Closed");
  const [questionSubtype, setQuestionSubtype] = useState<OpenQuestionSubtype | ClosedQuestionSubtype>('One');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      if (!window.getSelection?.()?.toString()) {
        setSelection(prev => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];

    if (!uploadedFile) {
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      let extractedText = "";

      if (uploadedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }
      else {
        console.log('uploadedFile', uploadedFile)
        extractedText = await uploadedFile.text();
      }

      setContent(extractedText);
    } catch (error) {
      console.error("Ошибка при чтении файла:", error);
      alert("Не удалось прочитать файл");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const sel = window.getSelection();

    if (!sel || sel.isCollapsed) {
      setSelection((prev) => ({ ...prev, visible: false }));
      return;
    }

    const text = sel.toString().trim();
    if (!text) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const container = containerRef.current;
    if (!container) return;
    const containerRect = (container as HTMLElement).getBoundingClientRect();

    setSelection({
      text,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      visible: true
    });
  };

  const handleGenerateQuestions = async (
    text: string,
    count: number,
    type: QuestionType = "Closed",
    subType: OpenQuestionSubtype | ClosedQuestionSubtype = "One"
  ) => {
    if (count < 1) {
      toast('Укажите количество вопросов');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/agent/generate', {
        testId: Number(testId),
        promptText: text,
        questionsCount: count,
        questionsType: type,
        questionsSubType: subType
      });

      setIsModalOpen(false);
      setSelection(s => ({ ...s, visible: false }));
      toast(`${count} ${count === 1 ? 'вопрос добавлен' : 'вопросов добавлено'} в очередь генерации`);
      navigate(`/tests/create/${testId}/questions`);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast('Тест не найден. Создайте новый тест в списке.');
      } else {
        toast('Произошла ошибка при постановке вопросов в очередь');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Загрузка материалов</h1>
        {file && (
          <Button variant="outline" onClick={() => { setFile(null); setContent(""); }}>
            <X className="mr-2 h-4 w-4" /> Сбросить
          </Button>
        )}
      </div>

      {!file ? (
        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-20 flex flex-col items-center justify-center bg-slate-50/50 transition-colors hover:bg-slate-50">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Перетащите файл или нажмите для выбора</p>
            <p className="text-sm text-muted-foreground">Поддерживаются DOCX и TXT до 20МБ</p>
          </div>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            accept=".docx,.txt"
          />
        </div>
      ) : (
        <div className="relative border rounded-xl bg-white shadow-sm overflow-hidden" ref={containerRef}>

          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-slate-500 animate-pulse">Анализируем структуру документа...</p>
            </div>
          ) : (
            <>
              <div className="border-b px-6 py-4 flex items-center gap-3 bg-slate-50/50 rounded-t-xl">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-slate-700">{file.name}</span>
              </div>

              <div
                className="p-8 leading-relaxed text-slate-800 select-text"
                onMouseUp={handleTextSelection}
              >
                {content}
              </div>

              {selection.visible && !isLoading && !isModalOpen && (
                <div
                  className="absolute z-[100] -translate-x-1/2 -translate-y-full pb-4 pointer-events-none"
                  style={{
                    left: selection.x,
                    top: selection.y,
                    position: 'absolute'
                  }}
                >
                  <Button
                    size="sm"
                    className="pointer-events-auto bg-white text-black shadow-2xl rounded-full px-4 py-5 hover:bg-white-50 hover:cursor-pointer border border-black/10 animate-in fade-in zoom-in duration-150"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Wand2 className="h-4 w-4 mr-2 text-blue-400" />
                    Создать вопросы
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(val) => {
        if (!val) {
          setSelection(s => ({ ...s, visible: false }));
        }
        setIsModalOpen(val);
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Генерация вопросов
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-[12px] uppercase font-bold tracking-wider">
                Выбранный фрагмент
              </Label>
              <div className="p-3 bg-slate-50 rounded-lg border text-sm italic text-slate-600 max-h-[300px] overflow-y-auto leading-relaxed">
                "{selection.text}"
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[16px] text-gray-900">Выберите тип вопросов</h2>
                  <p className="text-gray-500 text-sm">
                    Выберите тип вопросов, которые должна создать ИИ
                  </p>
                </div>

                <RadioGroup
                  value={questionType}
                  onValueChange={(v) => setQuestionType(v as QuestionType)}
                  className="grid grid-cols-2"
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                      questionType === "Closed" ? "border-black bg-black-50/30" : "border-gray-100"
                    )}
                    onClick={() => setQuestionType("Closed")}
                  >
                    <div className="space-y-1">
                      <Label htmlFor="Closed" className="text-lg font-bold cursor-pointer">
                        ЗЗТ
                      </Label>
                      <p className="text-gray-500 text-sm leading-tight">
                        Вопросы закрытого типа
                      </p>
                    </div>
                    <RadioGroupItem value="Closed" id="k8s" className="h-5 w-5 border-gray-300 text-blue-600" />
                  </div>

                  <div
                    className={cn(
                      "relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                      questionType === "Open" ? "border-black bg-black-50/30" : "border-gray-100"
                    )}
                    onClick={() => setQuestionType("Open")}
                  >
                    <div className="space-y-1">
                      <Label htmlFor="Open" className="text-lg font-bold cursor-pointer">
                        ЗОТ
                      </Label>
                      <p className="text-gray-500 text-sm leading-tight">
                        Вопросы открытого типа
                      </p>
                    </div>
                    <RadioGroupItem value={"Open"} id="Open" className="h-5 w-5 border-gray-300 text-blue-600" />
                  </div>
                </RadioGroup>
              </div>

              {questionType && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <h2 className="text-xl font-bold text-[16px] text-gray-900">Выберите подтип</h2>
                    <p className="text-gray-500 text-sm">Уточните формат вопросов</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {SUBTYPE_OPTIONS[questionType].map((subtype) => (
                      <div
                        key={subtype.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-slate-50",
                          questionSubtype === subtype.id ? "border-blue-500 bg-blue-50/50" : "border-gray-100"
                        )}
                        onClick={() => setQuestionSubtype(subtype.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{subtype.label}</span>
                          <span className="text-xs text-gray-500">{subtype.desc}</span>
                        </div>
                        <div className={cn(
                          "h-4 w-4 rounded-full border flex items-center justify-center",
                          questionSubtype === subtype.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        )}>
                          {questionSubtype === subtype.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[16px] text-gray-900">Количество вопросов</h2>
                  <p className="text-gray-500 text-sm">Выберите количество вопросов, которое должна сгенерировать ИИ</p>
                </div>

                <div className="flex items-center border rounded-lg overflow-hidden h-10">
                  <div className="px-4 py-2 text-lg font-medium min-w-[60px] text-center">
                    {questionCount}
                  </div>
                  <div className="flex border-l h-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none border-r h-full w-10 hover:bg-gray-50"
                      onClick={() => setQuestionCount((prev) => Math.max(0, prev - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none h-full w-10 hover:bg-gray-50"
                      onClick={() => setQuestionCount((prev) => prev + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Отмена</Button>
            <Button
              onClick={() => handleGenerateQuestions(selection.text, questionCount, questionType, questionSubtype)}
              disabled={isSubmitting || questionCount < 1}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Добавление в очередь…
                </>
              ) : (
                'Сгенерировать'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
