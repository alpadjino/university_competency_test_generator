import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FileText,
  Zap,
  Trash2Icon,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from '@/api/axios';
import { toast } from 'sonner';

interface Test {
  id: number;
  name: string;
  description: string;
  status: string;
  files: string[];
  updated_at: string;
  created_at: string;
}

export default function TestsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [tests, setTests] = useState<Test[] | null>(null);

  useEffect(() => {
    api.get<Test[]>('/tests/list')
      .then((res) => setTests(res.data))
      .catch(() => toast("Ошибка при получении тестов"))
  }, []);

  const filteredTests = useMemo(() => {
    return tests ? tests.filter(test => {
      const matchesFilter = filter === 'all' || test.status === filter;
      const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    }) : [];
  }, [filter, search, tests]);

  const handleCreateTest = () => {
    api.post('/tests/create', {})
      .then((res) => {
        navigate(`create/${res.data.id}`);
        toast("Новый тест создан.")
      })
  };

  const handleDeleteTest = async (testId: number) => {
    if (tests) {
      await api.delete(`/tests/${testId}/delete`)
        .then(() => {
          setTests(prev => prev && prev.filter((test) => test.id !== testId))
          toast("Тест удален.");
        })
        .catch(() => toast("Ошибка при удалении теста"));
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string, variant: "default" | "secondary" | "outline" | "success" }> = {
      in_progress: { label: 'В прогрессе', variant: 'outline' },
      completed: { label: 'Завершено', variant: 'default' }
    };
    const current = config[status] || config.in_progress;
    // /tests/create/9/upload-documents
    return (
      <Badge variant={'ghost'} className={status === 'completed' ? "bg-green-100 text-green-800 hover:bg-green-100 border-none" : ""}>
        {current.label}
      </Badge>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление тестами</h1>
          <p className="text-muted-foreground mt-1">
            Всего тестов в системе: {tests?.length || 0}
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleCreateTest}>
          <Plus className="h-4 w-4" /> Создать новый тест
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="in_progress">В прогрессе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold py-4">Тест / Файлы</TableHead>
              <TableHead className="font-semibold">Компетенции</TableHead>
              <TableHead className="font-semibold">Ответственный</TableHead>
              <TableHead className="font-semibold">Срок</TableHead>
              <TableHead className="font-semibold text-right">Статус</TableHead>
              <TableHead className="font-semibold text-right">{/* Удаление */}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.map((test) => (
              <TableRow
                key={test.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`create/${test.id}`)}
              >
                <TableCell className="py-4">
                  <div className="font-semibold text-base mb-1">{test.name}</div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      {test.files.map((file, idx) => (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <FileText className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent>{file}</TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {test?.competencies?.map((comp) => (
                      <Badge key={comp} variant="secondary" className="font-normal text-[10px] gap-1 px-1.5">
                        <Zap className="h-3 w-3" /> {comp}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{test?.assignedTo}</div>
                  <div className="text-xs text-muted-foreground">{test?.category}</div>
                </TableCell>
                <TableCell className="text-sm">
                  {test?.dueDate}
                </TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(test.status)}
                </TableCell>
                <TableCell
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleDeleteTest(test.id);
                  }}
                >
                  <div className='flex w-full justify-end'>
                    <Trash2Icon />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}