import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import { CATEGORIES } from '@/types/index';
import { formatCurrency } from '@/lib/format';

// Schema de validação com Zod
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo de transação',
  }),
  amount: z.string().refine((val) => {
    const num = parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, {
    message: 'O valor deve ser maior que R$ 0,00',
  }),
  category: z.string({
    required_error: 'Selecione uma categoria',
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: 'Selecione uma data',
  }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormValues) => void;
  initialData?: Partial<TransactionFormValues>;
  isLoading?: boolean;
  title?: string;
  successMessage?: string;
  errorMessage?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Nova Transação',
  successMessage,
  errorMessage,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState('');
  
  // Configuração do formulário com react-hook-form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || 'expense',
      amount: initialData?.amount || '',
      category: initialData?.category || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date(),
    },
  });

  // Efeito para formatar o valor em moeda
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'amount') {
        const numericValue = value.amount?.replace('R$', '').replace(/\./g, '').replace(',', '.');
        if (numericValue && !isNaN(parseFloat(numericValue))) {
          const formatted = formatCurrency(parseFloat(numericValue));
          setFormattedAmount(formatted);
        } else if (!value.amount) {
          setFormattedAmount('');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Efeito para mostrar mensagem de sucesso
  useEffect(() => {
    if (successMessage) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Função para lidar com a mudança no campo de valor
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    form.setValue('amount', value);
  };

  // Função para submeter o formulário
  const handleSubmit = (data: TransactionFormValues) => {
    // Converte o valor formatado para número
    const numericAmount = parseFloat(data.amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    
    onSubmit({
      ...data,
      amount: numericAmount.toString(),
    });
  };

  // Filtra categorias com base no tipo de transação
  const getFilteredCategories = () => {
    if (form.watch('type') === 'income') {
      return CATEGORIES.filter(cat =>
        ['Salário', 'Freelance', 'Investimentos', 'Vendas'].includes(cat.name)
      );
    }
    return CATEGORIES.filter(cat =>
      !['Salário', 'Freelance', 'Investimentos', 'Vendas'].includes(cat.name)
    );
  };

  return (
    <AnimatedCard 
      className="w-full max-w-md mx-auto card-hover-glow" 
      variant="glow"
      title={title}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Campo Tipo (Receita/Despesa) */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-heading text-base">Tipo de Transação</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-1"
                  >
                    <div className="flex-1">
                      <RadioGroupItem
                        value="income"
                        id="income"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="income"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary transition-smooth cursor-pointer btn-bounce"
                      >
                        <TrendingUp className="mb-2 h-6 w-6 text-green-600" />
                        Receita
                      </Label>
                    </div>
                    <div className="flex-1">
                      <RadioGroupItem
                        value="expense"
                        id="expense"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="expense"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 peer-data-[state=checked]:text-destructive transition-smooth cursor-pointer btn-bounce"
                      >
                        <TrendingDown className="mb-2 h-6 w-6 text-red-600" />
                        Despesa
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Valor */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading text-base">Valor</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="R$ 0,00"
                      value={field.value}
                      onChange={handleAmountChange}
                      className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </FormControl>
                {formattedAmount && (
                  <FormDescription className="font-semibold text-lg">
                    {formattedAmount}
                  </FormDescription>
                )}
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
                <FormLabel className="font-heading text-base">Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="transition-smooth focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getFilteredCategories().map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `hsl(${category.color})` }}></span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Data */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-heading text-base">Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal transition-smooth focus:ring-2 focus:ring-primary/20 ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading text-base">Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione uma descrição para esta transação"
                    className="resize-none transition-smooth focus:ring-2 focus:ring-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mensagens de Feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {isSuccess && successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 text-success border border-success/20 animate-fade-in-up">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* Botão de Submit */}
          <AnimatedButton
            type="submit"
            loading={isLoading}
            success={isSuccess}
            successText="Salvo com sucesso!"
            loadingText="Salvando..."
            variant="gradient"
            className="w-full"
            ripple
          >
            Salvar Transação
          </AnimatedButton>
        </form>
      </Form>
    </AnimatedCard>
  );
};

export default TransactionForm;