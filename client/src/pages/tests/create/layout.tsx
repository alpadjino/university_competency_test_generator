import { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Check, Pencil, Plus, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/api/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface Competencies {
  id: number;
  name: string;
  description: string;
};

export default function CreateTestLayout() {
  const location = useLocation();
  const { testId } = useParams<'testId'>();

  const [createdAt, setCreatedAt] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [competencies, setCompetencies] = useState<Competencies[]>([]);
  const [competenciesList, setCompetenciesList] = useState<Competencies[]>([]);

  const [title, setTitle] = useState("Заголовок");
  const lastSavedTitle = useRef(title);

  const [description, setDescription] = useState("Описание");
  const lastSavedDescription = useRef(description);

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleAbortController = useRef<AbortController | null>(null);

  const descriptionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descriptionAbortController = useRef<AbortController | null>(null);

  const handleChangeTitle = (newTitle: string) => {
    if (titleTimer.current) {
      clearTimeout(titleTimer.current);
    }

    if (titleAbortController.current) {
      titleAbortController.current.abort();
    }

    titleAbortController.current = new AbortController();
    setTitle(newTitle);

    titleTimer.current = setTimeout(() => {
      api.post(
        `/tests/${testId}/set-title`,
        { title: newTitle },
        { signal: titleAbortController.current?.signal }
      )
        .then(() => { lastSavedTitle.current = newTitle })
        .catch(() => {
          setTitle(lastSavedTitle.current);
          toast('Ошибка при сохранении заголовка');
        });
    }, 2000);
  };

  const handleChangeDescription = (newDescription: string) => {
    if (descriptionTimer.current) {
      clearTimeout(descriptionTimer.current);
    }

    if (descriptionAbortController.current) {
      descriptionAbortController.current.abort();
    }

    descriptionAbortController.current = new AbortController();

    setDescription(newDescription);

    descriptionTimer.current = setTimeout(() => {
      api.post(
        `/tests/${testId}/set-description`,
        { description: newDescription },
        { signal: descriptionAbortController.current?.signal }
      )
        .then(() => { lastSavedDescription.current = newDescription })
        .catch(() => {
          setDescription(lastSavedDescription.current);
          toast('Ошибка при сохранении описания')
        });
    }, 2000);
  };

  const currentTab = location.pathname.split("/").pop() || "upload";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [description, adjustHeight]);

  useEffect(() => {
    api.get(`/tests/${testId}/get`)
      .then((res) => {
        setTitle(res.data.name);
        lastSavedTitle.current = res.data.name;

        setDescription(res.data.description);
        lastSavedDescription.current = res.data.description;

        setCreatedAt(res.data.createdAt);

        setCompetencies(res.data.competencies)
      })
      .catch(() => toast("Ошибка при получении теста"));
  }, [testId]);

  useEffect(() => {
    api.get<Competencies[]>('/competencies/list')
      .then((res) => setCompetenciesList(res.data))
      .catch(() => toast('Ошибка при получении списка компетенций'));
  }, []);

  const addCompetency = useCallback((comp: Competencies) => {
    api.post(`tests/${testId}/add-competency`, { competenciesId: comp.id })
      .then((res) => setCompetencies(res.data.competencies))
      .catch(() => toast('Ошибка при добавлении компетенции'));
  }, [testId]);


  const removeCompetency = useCallback((comp: Competencies) => {
    api.post(`tests/${testId}/remove-competency`, { competenciesId: comp.id })
      .then(() => setCompetencies((prev) => prev.filter(c => c.id !== comp.id)))
      .catch(() => toast('Ошибка при удалении компетенции'));
  }, [testId]);

  const handleSelect = useCallback((comp: Competencies) => {
    const isAdded = competencies.find(({ id }) => id === comp.id);

    if (!isAdded) {
      addCompetency(comp)
    }
    setOpen(false);
  }, [competencies, addCompetency]);

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-10">
      <header className="group space-y-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-muted-foreground/50 uppercase tracking-widest border-b border-border/40 pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-primary/60" />
              <span>{createdAt ? format(new Date(createdAt), "dd MMM yyyy", { locale: ru }) : "Новый тест"}</span>
            </div>
            <div className="font-mono">ID: <span className="text-foreground/60">{testId || 'draft'}</span></div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary/70 rounded-full border border-primary/10">
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span className="text-[10px]">Редактирование</span>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          <div className="relative group/item flex items-start gap-4">
            <input
              value={title}
              onChange={(e) => handleChangeTitle(e.target.value)}
              placeholder="Назовите ваш тест..."
              className="w-full bg-transparent text-5xl font-black tracking-tight outline-none placeholder:text-muted-foreground/20 border-b-2 border-transparent focus:border-primary/20 pb-2"
            />
            <Pencil className="mt-4 opacity-0 group-hover/item:opacity-20 w-6 h-6 shrink-0" />
          </div>

          <div className="relative group/item flex items-start gap-4">
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => handleChangeDescription(e.target.value)}
              placeholder="Краткое описание..."
              rows={1}
              className="w-full bg-transparent text-xl text-muted-foreground/80 leading-relaxed outline-none resize-none border-l-2 border-transparent hover:border-muted/30 focus:border-primary/30 pl-6 py-1"
            />
            <Pencil className="mt-2 opacity-0 group-hover/item:opacity-20 w-5 h-5 shrink-0" />
          </div>
        </div>

        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/40 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            <Target className="w-4 h-4 text-primary/70" />
            <span>Компетенции теста</span>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {competencies.map((comp) => (
              <div
                key={comp.name}
                className="group/badge flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl text-sm transition-all hover:border-primary/40"
              >
                <span className="font-medium">{comp.name}</span>
                <button onClick={() => removeCompetency(comp)} className="opacity-30 hover:opacity-100 hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="rounded-xl border-dashed border-muted-foreground/40 h-[38px] hover:border-primary/50 hover:bg-background"
                >
                  <Plus className="mr-2 h-4 w-4 opacity-50" />
                  Добавить
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Поиск компетенции..." />
                  <CommandList>
                    <CommandEmpty>Ничего не найдено.</CommandEmpty>
                    <CommandGroup>
                      {competenciesList.map((comp) => (
                        <CommandItem
                          key={comp.name}
                          value={comp.name}
                          onSelect={() => handleSelect(comp)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              competencies.find(({ id }) => id === comp.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {comp.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <Separator className="bg-primary/10" />

      <Tabs value={currentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl mb-10">
          <TabsTrigger value="upload-documents" asChild className="rounded-lg data-[state=active]:shadow-md">
            <Link replace to='upload-documents'>Загрузка документов</Link>
          </TabsTrigger>
          <TabsTrigger value="questions" asChild className="rounded-lg data-[state=active]:shadow-md">
            <Link replace to="questions">Сгенерированные вопросы</Link>
          </TabsTrigger>
          <TabsTrigger value="final" asChild className="rounded-lg data-[state=active]:shadow-md">
            <Link replace to="final">Итоговый тест</Link>
          </TabsTrigger>
        </TabsList>

        <Card className="border-2 border-dashed border-muted bg-card/30 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8">
            <Outlet />
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}