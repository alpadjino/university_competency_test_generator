import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  GraduationCap,
  MoreVertical,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import api from '@/api/axios';
import { toast } from 'sonner';

interface Competency {
  id: string;
  name: string;
  description: string;
}

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const { signal } = new AbortController();

    api.get<Competency[]>('/competencies/list', { signal })
      .then(({ data }) => setCompetencies(data))
      .catch((err) => {
        const message = typeof err === "string" ? err : "Ошибка при получении компетенций";
        toast.error(message, { position: 'top-center' });
      });
  }, []);

  const handleCreate = () => {
    if (!newName) {
      return;
    }

    const newComp = {
      name: newName,
      description: newDesc,
    };

    api.post<Competency>('/competencies/create', newComp)
      .then(({ data }) => {
        setCompetencies([data, ...competencies]);
        setNewName('');
        setNewDesc('');
        setIsDialogOpen(false);
      })
      .catch((err) => {
        const message = typeof err === "string" ? err : "Ошибка при создании компетенции";
        toast.error(message, { position: 'top-center' });
      });

  };

  const filteredCompetencies = competencies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Библиотека компетенций</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте набором навыков и умений ваших сотрудников
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Добавить компетенцию
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Новая компетенция</DialogTitle>
              <DialogDescription>
                Введите название и описание навыка. Нажмите сохранить, когда закончите.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Напр: React Native"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Опишите, что должен знать сотрудник..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleCreate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по компетенциям..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Content */}
      <Card className="border-none shadow-none bg-transparent">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Компетенция</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.length > 0 ? (
                filteredCompetencies.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        {comp.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground line-clamp-1">
                      {comp.description}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Компетенции не найдены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}