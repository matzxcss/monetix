import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Target, 
  PiggyBank, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  DollarSign,
  Trophy,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import ParticleEffect from '@/components/ui/particle-effect';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

// Schema de validação com Zod
const goalSchema = z.object({
  title: z.string().min(1, 'O título da meta é obrigatório'),
  target_amount: z.string().refine((val) => {
    const num = parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, {
    message: 'O valor alvo deve ser maior que R$ 0,00',
  }),
  current_amount: z.string().refine((val) => {
    const num = parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    return !isNaN(num) && num >= 0;
  }, {
    message: 'O valor atual deve ser maior ou igual a R$ 0,00',
  }),
  deadline: z.date().optional().refine((date) => {
    if (!date) return true; // Data é opcional
    return date > new Date();
  }, {
    message: 'A data limite deve ser uma data futura',
  }),
  category: z.string().optional(),
}).refine((data) => {
  const current = parseFloat(data.current_amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
  const target = parseFloat(data.target_amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
  return current <= target;
}, {
  message: 'O valor atual não pode ser maior que o valor alvo',
  path: ['current_amount'],
});

export type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onSubmit: (data: GoalFormValues) => void;
  initialData?: Partial<GoalFormValues>;
  isLoading?: boolean;
  title?: string;
}

const GoalForm: React.FC<GoalFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Nova Meta',
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formattedTargetAmount, setFormattedTargetAmount] = useState('');
  const [formattedCurrentAmount, setFormattedCurrentAmount] = useState('');
  
  // Configuração do formulário com react-hook-form
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      target_amount: initialData?.target_amount || '',
      current_amount: initialData?.current_amount || 'R$ 0,00',
      deadline: initialData?.deadline || undefined,
      category: initialData?.category || '',
    },
  });

  // Efeito para formatar os valores em moeda
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'target_amount') {
        const numericValue = value.target_amount?.replace('R$', '').replace(/\./g, '').replace(',', '.');
        if (numericValue && !isNaN(parseFloat(numericValue))) {
          const formatted = formatCurrency(parseFloat(numericValue));
          setFormattedTargetAmount(formatted);
        } else if (!value.target_amount) {
          setFormattedTargetAmount('');
        }
      }
      
      if (name === 'current_amount') {
        const numericValue = value.current_amount?.replace('R$', '').replace(/\./g, '').replace(',', '.');
        if (numericValue && !isNaN(parseFloat(numericValue))) {
          const formatted = formatCurrency(parseFloat(numericValue));
          setFormattedCurrentAmount(formatted);
        } else if (!value.current_amount) {
          setFormattedCurrentAmount('R$ 0,00');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Efeito para mostrar confete quando meta é alcançada
  useEffect(() => {
    const targetValue = parseFloat(form.watch('target_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    const currentValue = parseFloat(form.watch('current_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    
    if (targetValue > 0 && currentValue >= targetValue) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [form]);

  // Função para lidar com a mudança nos campos de valor
  const handleAmountChange = (field: 'target_amount' | 'current_amount', e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove caracteres não numéricos exceto vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Formata para moeda brasileira
    if (value) {
      // Remove vírgulas existentes
      value = value.replace(',', '');
      
      // Adiciona a vírgula para os centavos
      if (value.length > 2) {
        value = value.slice(0, -2) + ',' + value.slice(-2);
      }
      
      // Adiciona pontos como separadores de milhar
      value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }
    
    form.setValue(field, value);
  };

  // Função para submeter o formulário
  const handleSubmit = (data: GoalFormValues) => {
    // Converte os valores formatados para número
    const targetAmount = parseFloat(data.target_amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    const currentAmount = parseFloat(data.current_amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    
    onSubmit({
      ...data,
      target_amount: targetAmount.toString(),
      current_amount: currentAmount.toString(),
    });
    
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // Calcula o percentual de progresso
  const calculateProgress = () => {
    const targetValue = parseFloat(form.watch('target_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    const currentValue = parseFloat(form.watch('current_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    
    if (targetValue === 0) return 0;
    return Math.min(Math.round((currentValue / targetValue) * 100), 100);
  };

  // Verifica se a meta foi alcançada
  const isGoalCompleted = () => {
    const targetValue = parseFloat(form.watch('target_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    const currentValue = parseFloat(form.watch('current_amount')?.replace('R$', '').replace(/\./g, '').replace(',', '.') || '0');
    
    return targetValue > 0 && currentValue >= targetValue;
  };

  const progress = calculateProgress();
  const completed = isGoalCompleted();

  return (
    <div className="relative">
      {showConfetti && (
        <ParticleEffect 
          className="fixed inset-0 z-50" 
          particleCount={50}
          colors={["#008080", "#CC5500", "#0E5555", "#FFD700"]}
          variant="bubbles"
        />
      )}
      
      <AnimatedCard 
        className="w-full max-w-md mx-auto card-hover-glow" 
        variant="glow"
        title={title}
        icon={<Target className="h-5 w-5 text-primary" />}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Campo Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Título da Meta
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Comprar um carro novo"
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Valor Alvo */}
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-secondary" />
                    Valor Alvo
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value}
                        onChange={(e) => handleAmountChange('target_amount', e)}
                        className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </FormControl>
                  {formattedTargetAmount && (
                    <FormDescription className="font-semibold text-lg text-secondary">
                      {formattedTargetAmount}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Valor Atual */}
            <FormField
              control={form.control}
              name="current_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-base flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-primary" />
                    Valor Atual
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value}
                        onChange={(e) => handleAmountChange('current_amount', e)}
                        className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </FormControl>
                  {formattedCurrentAmount && (
                    <FormDescription className="font-semibold text-lg text-primary">
                      {formattedCurrentAmount}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visual de Progresso */}
            {(form.watch('target_amount') && form.watch('current_amount')) && (
              <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progresso</span>
                  <Badge 
                    variant={completed ? "default" : "secondary"}
                    className={cn(
                      "transition-smooth",
                      completed && "bg-gradient-to-r from-primary to-secondary text-white"
                    )}
                  >
                    {progress}%
                  </Badge>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3 progress-animate"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formattedCurrentAmount || 'R$ 0,00'}</span>
                  <span>{formattedTargetAmount || 'R$ 0,00'}</span>
                </div>
                {completed && (
                  <div className="flex items-center gap-2 text-green-600 animate-fade-in-up">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-medium">Meta alcançada! Parabéns! 🎉</span>
                  </div>
                )}
              </div>
            )}

            {/* Campo Data Limite */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-heading text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Data Limite (Opcional)
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal transition-smooth focus:ring-2 focus:ring-primary/20",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date <= new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-heading text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Categoria (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Viagem, Educação, Emergência"
                      className="transition-smooth focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mensagens de Feedback */}
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{form.formState.errors.root.message}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success border border-success/20 animate-fade-in-up">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Meta salva com sucesso!</span>
              </div>
            )}

            {/* Botão de Submit */}
            <AnimatedButton
              type="submit"
              loading={isLoading}
              success={isSuccess}
              successText="Meta salva!"
              loadingText="Salvando..."
              variant="gradient"
              className="w-full btn-bounce"
              ripple
              icon={completed ? <Trophy className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            >
              {completed ? (
                <span className="flex items-center gap-2">
                  Meta Concluída!
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </span>
              ) : (
                'Salvar Meta'
              )}
            </AnimatedButton>
          </form>
        </Form>
      </AnimatedCard>
    </div>
  );
};

export default GoalForm;