import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ArrowLeftRight
} from 'lucide-react';

import { transactionApi, TransactionFilters } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import { CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import AnimatedLoader from '@/components/ui/animated-loader';
import ParticleEffect from '@/components/ui/particle-effect';
import TransactionForm from '@/components/TransactionForm';
import { TransactionRow } from '@/lib/api';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const Transactions = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Buscar transações
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id, filters],
    queryFn: () => transactionApi.getTransactions(user?.id || '', filters),
    enabled: !!user,
    select: (data) => data.data || []
  });

  // Mutação para criar transação
  const createMutation = useMutation({
    mutationFn: (data: {
      type: 'income' | 'expense';
      amount: string;
      category: string;
      description?: string;
      date: Date;
    }) => transactionApi.createTransaction({
      user_id: user?.id || '',
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description || '',
      date: data.date.toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsFormOpen(false);
      setEditingTransaction(null);
      setSuccessMessage('Transação criada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao criar transação. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Mutação para atualizar transação
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: string,
      data: {
        type: 'income' | 'expense';
        amount: string;
        category: string;
        description?: string;
        date: Date;
      }
    }) =>
      transactionApi.updateTransaction(id, {
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description || '',
        date: data.date.toISOString().split('T')[0]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsFormOpen(false);
      setEditingTransaction(null);
      setSuccessMessage('Transação atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao atualizar transação. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Mutação para excluir transação
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      setSuccessMessage('Transação excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao excluir transação. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  }, [transactions]);

  // Calcular dados para o gráfico mensal
  const monthlyData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      last6Months.push({
        month: format(date, 'MMM', { locale: ptBR }),
        income,
        expenses,
        balance: income - expenses
      });
    }
    
    return last6Months;
  }, [transactions]);

  // Filtrar e ordenar transações
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;
    
    // Aplicar busca por descrição
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return Number(b.amount) - Number(a.amount);
        case 'amount-asc':
          return Number(a.amount) - Number(b.amount);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [transactions, searchTerm, sortOption]);

  // Manipuladores de eventos
  const handleCreateTransaction = (data: {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description?: string;
    date: Date;
  }) => {
    createMutation.mutate(data);
  };

  const handleUpdateTransaction = (data: {
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description?: string;
    date: Date;
  }) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    }
  };

  const handleEditTransaction = (transaction: TransactionRow) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openNewTransactionForm = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <ParticleEffect variant="bubbles" className="opacity-30" />
        <AnimatedLoader variant="wallet" size="lg" text="Carregando suas finanças..." />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <ParticleEffect variant="bubbles" className="opacity-30" />
        <AnimatedLoader variant="wallet" size="lg" text="Verificando autenticação..." />
      </div>
    );
  }

  // Encontrar valor máximo para o gráfico
  const maxChartValue = Math.max(
    ...monthlyData.map(d => Math.max(d.income, d.expenses)),
    1
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Background Particle Effect */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <ParticleEffect variant="floating" particleCount={20} />
      </div>
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold flex items-center gap-3">
                <ArrowLeftRight className="w-8 h-8" />
                Transações
              </h2>
              <p className="text-white/90 text-lg mt-1">Gerencie suas receitas e despesas</p>
            </div>
            <AnimatedButton
              onClick={openNewTransactionForm}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              icon={<Plus className="w-5 h-5" />}
            >
              Nova Transação
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-animation">
        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<Wallet className="w-6 h-6 text-primary" />}
          title="Saldo Total"
        >
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(stats.balance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Receitas - Despesas
          </p>
        </AnimatedCard>

        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<TrendingUp className="w-6 h-6 text-success" />}
          title="Receitas"
        >
          <div className="text-2xl font-bold text-success">
            {formatCurrency(stats.income)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Total de entradas
          </p>
        </AnimatedCard>

        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<TrendingDown className="w-6 h-6 text-destructive" />}
          title="Despesas"
        >
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(stats.expenses)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Total de saídas
          </p>
        </AnimatedCard>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <AnimatedCard variant="glass" className="card-hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <div 
                    className="bg-success/80 rounded-t-sm transition-smooth hover:bg-success"
                    style={{ 
                      height: `${(data.income / maxChartValue) * 100}%`,
                      minHeight: data.income > 0 ? '4px' : '0'
                    }}
                    title={`Receitas: ${formatCurrency(data.income)}`}
                  />
                  <div 
                    className="bg-destructive/80 rounded-b-sm transition-smooth hover:bg-destructive"
                    style={{ 
                      height: `${(data.expenses / maxChartValue) * 100}%`,
                      minHeight: data.expenses > 0 ? '4px' : '0'
                    }}
                    title={`Despesas: ${formatCurrency(data.expenses)}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success/80 rounded-sm"></div>
              <span className="text-xs text-muted-foreground">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive/80 rounded-sm"></div>
              <span className="text-xs text-muted-foreground">Despesas</span>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Filtros e Busca */}
      <Card className="card-hover-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar transação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `hsl(${category.color})` }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sortOption} 
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data (mais recente)
                  </div>
                </SelectItem>
                <SelectItem value="date-asc">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data (mais antiga)
                  </div>
                </SelectItem>
                <SelectItem value="amount-desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Valor (maior)
                  </div>
                </SelectItem>
                <SelectItem value="amount-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Valor (menor)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card className="card-hover-glow overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5" />
              Transações
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredAndSortedTransactions.length} transação{filteredAndSortedTransactions.length !== 1 ? 'ões' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <AnimatedLoader variant="wallet" size="md" text="Carregando transações..." />
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <ArrowLeftRight className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                Nenhuma transação encontrada
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Comece adicionando sua primeira transação!
              </p>
              <AnimatedButton
                onClick={openNewTransactionForm}
                variant="gradient"
                className="mt-4"
                icon={<Plus className="w-4 h-4" />}
              >
                Adicionar Transação
              </AnimatedButton>
            </div>
          ) : (
            <div className="space-y-3 stagger-animation">
              {filteredAndSortedTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-smooth hover:scale-[1.02] cursor-pointer group",
                    transaction.type === 'income'
                      ? 'bg-success/5 hover:bg-success/10 border-success/20'
                      : 'bg-destructive/5 hover:bg-destructive/10 border-destructive/20'
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center transition-smooth',
                      transaction.type === 'income'
                        ? 'bg-success/10 group-hover:bg-success/20'
                        : 'bg-destructive/10 group-hover:bg-destructive/20'
                    )}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-6 h-6 text-success" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'font-semibold text-lg text-right',
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTransaction(transaction)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Flutuante para Mobile */}
      <Button
        onClick={openNewTransactionForm}
        className="fixed bottom-20 right-4 md:hidden h-14 w-14 rounded-full shadow-lg gradient-primary text-white border-0 z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? 'Edite as informações da sua transação financeira.'
                : 'Preencha as informações para adicionar uma nova transação.'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
            initialData={editingTransaction ? {
              type: editingTransaction.type as 'income' | 'expense',
              amount: editingTransaction.amount.toString(),
              category: editingTransaction.category,
              description: editingTransaction.description || '',
              date: new Date(editingTransaction.date)
            } : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
            successMessage={successMessage}
            errorMessage={errorMessage}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mensagens de Feedback */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
          <div className="flex items-center gap-2 p-4 rounded-md bg-success/10 text-success border border-success/20 shadow-lg">
            <Check className="w-5 h-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
          <div className="flex items-center gap-2 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 shadow-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;