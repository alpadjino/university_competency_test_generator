import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InstructionStep: React.FC<{
  title: string;
  description: string;
  chips?: string[];
}> = ({ title, description, chips }) => {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold leading-none tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {chips && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-medium"
            >
              {chip}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default function GeneralPage() {
  const steps = [
    {
      label: 'Аутентификация',
      content: {
        title: 'Вход в систему',
        description: 'Используйте корпоративные учетные данные для входа в защищенную среду платформы.',
        chips: ['Логин', 'Пароль', '2FA']
      }
    },
    {
      label: 'Навигация',
      content: {
        title: 'Основные разделы',
        description: 'Основные модули доступны через главное меню. Используйте боковую панель для быстрого перехода.',
        chips: ['Дашборд', 'Аналитика', 'Отчеты']
      }
    },
    {
      label: 'Работа с данными',
      content: {
        title: 'Импорт и обработка',
        description: 'Загружайте данные через стандартизированные формы. Проверяйте целостность данных перед обработкой.',
        chips: ['CSV', 'Excel', 'Валидация']
      }
    },
    {
      label: 'Экспорт результатов',
      content: {
        title: 'Формирование отчетов',
        description: 'Генерируйте отчеты в установленных форматах. Доступны выгрузки в PDF, XLSX и CSV.',
        chips: ['Экспорт', 'Шаблоны', 'Автоматизация']
      }
    }
  ];

  return (
    <Card className="max-w-3xl mx-auto mt-10 shadow-sm border-slate-200">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
          Руководство по работе с платформой
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8 pt-4">
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-6 pb-2">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shrink-0">
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div className="w-px grow bg-border my-2" />
                )}
              </div>

              <div className="flex flex-col pt-1.5 grow">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {step.label}
                </span>
                <InstructionStep
                  title={step.content.title}
                  description={step.content.description}
                  chips={step.content.chips}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Для получения технической поддержки обращайтесь в отдел IT-помощи. 
            Все действия в системе проходят аудит в соответствии с корпоративной политикой безопасности.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
