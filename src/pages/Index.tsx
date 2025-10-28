import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AnimatedLoader from '@/components/ui/animated-loader';
import ParticleEffect from '@/components/ui/particle-effect';
import { cn } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Transaction, Goal } from '@/types';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

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

  // Calculate metrics
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const monthlyTransactions = Array.isArray(transactions) ? transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }) : [];

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;
  const savings = balance > 0 ? balance * 0.2 : 0;

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];
  const activeGoals = Array.isArray(goals) ? goals.filter(g => !g.completed).slice(0, 3) : [];

  const isLoading = transactionsLoading || goalsLoading;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Background Particle Effect */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <ParticleEffect variant="floating" particleCount={20} />
      </div>
      
      {/* Welcome Section with Enhanced Visuals */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <h2 className="text-3xl font-heading font-bold">Olá! 👋</h2>
          </div>
          <p className="text-white/90 text-lg">Veja como estão suas finanças hoje</p>
        </div>
      </div>

      {/* Summary Cards with Enhanced Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-animation">
        {/* Balance */}
        <Card className="card-hover-glow gradient-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              Saldo Total
            </CardTitle>
            <Wallet className="w-4 h-4 opacity-90 float-animation" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="shimmer h-8 w-32 bg-white/20 rounded"></div>
            ) : (
              <div className="text-2xl font-bold animate-fade-in">{formatCurrency(balance)}</div>
            )}
            <p className="text-xs opacity-75 mt-1">
              Saldo do mês atual
            </p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="card-hover-glow bg-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success animate-pulse" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="shimmer h-8 w-32 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-success animate-fade-in">{formatCurrency(income)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Entradas do mês
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="card-hover-glow bg-destructive/5 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive animate-pulse" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="shimmer h-8 w-32 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-destructive animate-fade-in">{formatCurrency(expenses)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Saídas do mês
            </p>
          </CardContent>
        </Card>

        {/* Savings */}
        <Card className="card-hover-glow bg-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Economia
            </CardTitle>
            <PiggyBank className="w-4 h-4 text-secondary float-animation" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="shimmer h-8 w-32 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-secondary animate-fade-in">{formatCurrency(savings)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Potencial de economia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions with Enhanced Visuals */}
      <Card className="card-hover-glow gradient-glass border-primary/20">
        <CardHeader className="relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
          <CardTitle className="font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 btn-bounce transition-smooth hover:bg-primary/10 hover:border-primary/30 hover:scale-105 group"
              onClick={() => navigate('/transactions')}
            >
              <Plus className="w-5 h-5 group-hover:animate-bounce" />
              <span className="text-xs">Nova Transação</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 btn-bounce transition-smooth hover:bg-secondary/10 hover:border-secondary/30 hover:scale-105 group"
              onClick={() => navigate('/goals')}
            >
              <Target className="w-5 h-5 group-hover:animate-pulse" />
              <span className="text-xs">Nova Meta</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 btn-bounce transition-smooth hover:bg-success/10 hover:border-success/30 hover:scale-105 group"
              onClick={() => navigate('/transactions?type=income')}
            >
              <ArrowUpRight className="w-5 h-5 group-hover:animate-bounce" />
              <span className="text-xs">Adicionar Receita</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 btn-bounce transition-smooth hover:bg-destructive/10 hover:border-destructive/30 hover:scale-105 group"
              onClick={() => navigate('/transactions?type=expense')}
            >
              <ArrowDownRight className="w-5 h-5 group-hover:animate-bounce" />
              <span className="text-xs">Adicionar Despesa</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions with Enhanced Visuals */}
        <Card className="card-hover-glow overflow-hidden">
          <CardHeader className="gradient-glass">
            <CardTitle className="font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-16 w-full bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ArrowDownRight className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Nenhuma transação ainda. Comece adicionando uma!
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger-animation">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-smooth hover:scale-[1.02] cursor-pointer",
                      transaction.type === 'income'
                        ? 'bg-success/5 hover:bg-success/10 border border-success/20'
                        : 'bg-destructive/5 hover:bg-destructive/10 border border-destructive/20'
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-smooth',
                        transaction.type === 'income'
                          ? 'bg-success/10 group-hover:bg-success/20'
                          : 'bg-destructive/10 group-hover:bg-destructive/20'
                      )}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-success animate-pulse" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      'font-semibold text-lg',
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals with Enhanced Visuals */}
        <Card className="card-hover-glow overflow-hidden">
          <CardHeader className="gradient-glass">
            <CardTitle className="font-heading flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary animate-pulse" />
              Metas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-20 w-full bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Crie sua primeira meta e comece a economizar!
                </p>
              </div>
            ) : (
              <div className="space-y-4 stagger-animation">
                {activeGoals.map((goal, index) => {
                  const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                  return (
                    <div
                      key={goal.id}
                      className="space-y-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-smooth"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
                          {goal.title}
                        </p>
                        <p className="text-sm font-semibold text-secondary">{Math.round(progress)}%</p>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-secondary/60 progress-animate rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(Number(goal.current_amount))}</span>
                        <span>{formatCurrency(Number(goal.target_amount))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
