import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTypeByCode, type GenerationStatus, type QuestionEditable } from '@/types/question';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  Exclude<GenerationStatus, 'completed'>,
  { label: string; icon: typeof Clock; className: string }
> = {
  queued: {
    label: 'Вопрос в очереди на генерацию',
    icon: Clock,
    className: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  generating: {
    label: 'Вопрос генерируется…',
    icon: Loader2,
    className: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  failed: {
    label: 'Ошибка генерации',
    icon: AlertCircle,
    className: 'text-red-600 bg-red-50 border-red-200',
  },
};

interface QuestionSkeletonItemProps {
  question: QuestionEditable;
  order: number;
  taskStatus?: GenerationStatus | null;
}

export const QuestionSkeletonItem = ({ question, order, taskStatus }: QuestionSkeletonItemProps) => {
  const status = taskStatus ?? question.generationStatus ?? 'queued';
  const config = STATUS_CONFIG[status === 'completed' ? 'queued' : status];
  const Icon = config.icon;
  const { typeLabel, subtypeLabel } = getTypeByCode(question.type, question.subtype);

  return (
    <Card className="mb-6 border-l-4 border-l-orange-500 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-muted-foreground">
            Вопрос {order}
          </CardTitle>
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted">
            {typeLabel} · {subtypeLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium',
            config.className
          )}
        >
          <Icon className={cn('h-4 w-4 shrink-0', status === 'generating' && 'animate-spin')} />
          <span>{status === 'failed' && question.question ? question.question : config.label}</span>
        </div>

        {status !== 'failed' && (
          <div className="space-y-3 pl-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="grid gap-2 pt-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
