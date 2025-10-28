import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Target,
  Trophy,
  Calendar,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Tag,
  Star,
  Sparkles,
  Gift,
  Heart,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  Plane,
  Gamepad2,
  ShoppingCart,
  Zap,
  Award,
  Flag,
  Shield
} from 'lucide-react';

import { goalApi } from '@/lib/api';
import { formatCurrency, formatDate, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import AnimatedLoader from '@/components/ui/animated-loader';
import ParticleEffect from '@/components/ui/particle-effect';
import GoalForm from '@/components/GoalForm';
import { GoalRow } from '@/lib/api';
import { GoalFormValues } from '@/components/GoalForm';

// Componente para o ícone de escudo (substituto temporário)
const ShieldIcon = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

// Componente para o ícone de gráfico de pizza (substituto temporário)
const PieChart = ({ className }: { className?: string }) => (
  <div className={className}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

type SortOption = 'progress-desc' | 'progress-asc' | 'deadline-asc' | 'deadline-desc' | 'amount-desc' | 'amount-asc';
type FilterStatus = 'all' | 'active' | 'completed';

// Categorias de metas com ícones
const GOAL_CATEGORIES = [
  { name: 'Viagem', icon: Plane, color: 'bg-blue-500' },
  { name: 'Carro', icon: Car, color: 'bg-red-500' },
  { name: 'Casa', icon: Home, color: 'bg-green-500' },
  { name: 'Educação', icon: GraduationCap, color: 'bg-purple-500' },
  { name: 'Emergência', icon: ShieldIcon, color: 'bg-yellow-500' },
  { name: 'Investimento', icon: TrendingUp, color: 'bg-indigo-500' },
  { name: 'Lazer', icon: Gamepad2, color: 'bg-pink-500' },
  { name: 'Presentes', icon: Gift, color: 'bg-orange-500' },
  { name: 'Saúde', icon: Heart, color: 'bg-red-600' },
  { name: 'Tecnologia', icon: Zap, color: 'bg-cyan-500' },
  { name: 'Outros', icon: Tag, color: 'bg-gray-500' }
];

const Goals = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('progress-desc');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);
  const [goalForProgress, setGoalForProgress] = useState<GoalRow | null>(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Buscar metas
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => goalApi.getGoals(user?.id || ''),
    enabled: !!user,
    select: (data) => data.data || []
  });

  // Mutação para criar meta
  const createMutation = useMutation({
    mutationFn: (data: GoalFormValues) => {
      const goalData = {
        user_id: user?.id || '',
        title: data.title,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount),
        deadline: data.deadline?.toISOString().split('T')[0],
        category: data.category,
        completed: false
      };
      return goalApi.createGoal(goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsFormOpen(false);
      setEditingGoal(null);
      setSuccessMessage('Meta criada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao criar meta. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Mutação para atualizar meta
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: GoalFormValues }) => {
      const goalData = {
        title: data.title,
        target_amount: parseFloat(data.target_amount),
        current_amount: parseFloat(data.current_amount),
        deadline: data.deadline?.toISOString().split('T')[0],
        category: data.category
      };
      return goalApi.updateGoal(id, goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsFormOpen(false);
      setEditingGoal(null);
      setSuccessMessage('Meta atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao atualizar meta. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Mutação para adicionar progresso
  const addProgressMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string, amount: number }) => 
      goalApi.updateGoalProgress(id, amount),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsAddProgressOpen(false);
      setGoalForProgress(null);
      setProgressAmount('');
      setSuccessMessage('Progresso adicionado com sucesso!');
      
      // Verificar se a meta foi concluída
      if (response.data?.completed) {
        setShowConfetti(true);
        setSuccessMessage('Parabéns! Meta concluída! 🎉');
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao adicionar progresso. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Mutação para excluir meta
  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
      setSuccessMessage('Meta excluída com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage('Erro ao excluir meta. Tente novamente.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  });

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.completed).length;
    const activeGoals = totalGoals - completedGoals;
    const totalTargetAmount = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
    const overallProgress = totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0;
    
    return { 
      totalGoals, 
      completedGoals, 
      activeGoals, 
      totalTargetAmount, 
      totalCurrentAmount, 
      overallProgress 
    };
  }, [goals]);

  // Calcular distribuição por categoria
  const categoryDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; total: number }> = {};
    
    goals.forEach(goal => {
      const category = goal.category || 'Outros';
      if (!distribution[category]) {
        distribution[category] = { count: 0, total: 0 };
      }
      distribution[category].count++;
      distribution[category].total += Number(goal.target_amount);
    });
    
    return Object.entries(distribution).map(([name, data]) => ({
      name,
      count: data.count,
      total: data.total,
      percentage: stats.totalTargetAmount > 0 ? Math.round((data.total / stats.totalTargetAmount) * 100) : 0
    }));
  }, [goals, stats.totalTargetAmount]);

  // Encontrar meta mais próxima de ser concluída
  const closestGoal = useMemo(() => {
    const activeGoals = goals.filter(g => !g.completed);
    if (activeGoals.length === 0) return null;
    
    return activeGoals.reduce((closest, goal) => {
      const goalProgress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
      const closestProgress = (Number(closest.current_amount) / Number(closest.target_amount)) * 100;
      return goalProgress > closestProgress ? goal : closest;
    });
  }, [goals]);

  // Filtrar e ordenar metas
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals;
    
    // Aplicar filtro por status
    if (filterStatus === 'active') {
      filtered = filtered.filter(g => !g.completed);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(g => g.completed);
    }
    
    // Aplicar filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(g => g.category === filterCategory);
    }
    
    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.category && g.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar ordenação
    const sorted = [...filtered].sort((a, b) => {
      const aProgress = (Number(a.current_amount) / Number(a.target_amount)) * 100;
      const bProgress = (Number(b.current_amount) / Number(b.target_amount)) * 100;
      
      switch (sortOption) {
        case 'progress-desc':
          return bProgress - aProgress;
        case 'progress-asc':
          return aProgress - bProgress;
        case 'deadline-asc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'deadline-desc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case 'amount-desc':
          return Number(b.target_amount) - Number(a.target_amount);
        case 'amount-asc':
          return Number(a.target_amount) - Number(b.target_amount);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [goals, filterStatus, filterCategory, searchTerm, sortOption]);

  // Manipuladores de eventos
  const handleCreateGoal = (data: GoalFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateGoal = (data: GoalFormValues) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    }
  };

  const handleEditGoal = (goal: GoalRow) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleAddProgress = () => {
    if (goalForProgress && progressAmount) {
      const amount = parseFloat(progressAmount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0) {
        addProgressMutation.mutate({ id: goalForProgress.id, amount });
      }
    }
  };

  const handleOpenAddProgress = (goal: GoalRow) => {
    setGoalForProgress(goal);
    setProgressAmount('');
    setIsAddProgressOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    setGoalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteMutation.mutate(goalToDelete);
    }
  };

  const openNewGoalForm = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  // Função para calcular dias restantes
  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const days = differenceInDays(parseISO(deadline), new Date());
    return days;
  };

  // Função para obter ícone da categoria
  const getCategoryIcon = (category?: string) => {
    const categoryData = GOAL_CATEGORIES.find(c => c.name === category) || GOAL_CATEGORIES.find(c => c.name === 'Outros');
    return categoryData?.icon || Tag;
  };

  // Função para obter cor da categoria
  const getCategoryColor = (category?: string) => {
    const categoryData = GOAL_CATEGORIES.find(c => c.name === category) || GOAL_CATEGORIES.find(c => c.name === 'Outros');
    return categoryData?.color || 'bg-gray-500';
  };

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        <ParticleEffect variant="bubbles" className="opacity-30" />
        <AnimatedLoader variant="wallet" size="lg" text="Carregando suas metas..." />
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

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <ParticleEffect 
          className="fixed inset-0 z-50" 
          particleCount={50}
          colors={["#008080", "#CC5500", "#0E5555", "#FFD700"]}
          variant="bubbles"
        />
      )}
      
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
                <Target className="w-8 h-8" />
                Metas Financeiras
              </h2>
              <p className="text-white/90 text-lg mt-1">Acompanhe e alcance seus objetivos</p>
            </div>
            <AnimatedButton
              onClick={openNewGoalForm}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              icon={<Plus className="w-5 h-5" />}
            >
              Nova Meta
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-animation">
        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<Target className="w-6 h-6 text-primary" />}
          title="Total de Metas"
        >
          <div className="text-2xl font-bold text-primary">
            {stats.totalGoals}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.activeGoals} ativas, {stats.completedGoals} concluídas
          </p>
        </AnimatedCard>

        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<Trophy className="w-6 h-6 text-success" />}
          title="Concluídas"
        >
          <div className="text-2xl font-bold text-success">
            {stats.completedGoals}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0}% do total
          </p>
        </AnimatedCard>

        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<DollarSign className="w-6 h-6 text-secondary" />}
          title="Valor Total"
        >
          <div className="text-2xl font-bold text-secondary">
            {formatCurrency(stats.totalTargetAmount)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(stats.totalCurrentAmount)} economizado
          </p>
        </AnimatedCard>

        <AnimatedCard 
          variant="glow" 
          className="card-hover-glow"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
          title="Progresso Geral"
        >
          <div className="text-2xl font-bold text-accent">
            {stats.overallProgress}%
          </div>
          <div className="mt-2">
            <Progress value={stats.overallProgress} className="h-2 progress-animate" />
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Metas */}
        <div className="lg:col-span-2 space-y-6">
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
                    placeholder="Buscar meta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select 
                  value={filterStatus} 
                  onValueChange={(value) => setFilterStatus(value as FilterStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filterCategory} 
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {GOAL_CATEGORIES.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
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
                    <SelectItem value="progress-desc">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Progresso (maior)
                      </div>
                    </SelectItem>
                    <SelectItem value="progress-asc">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Progresso (menor)
                      </div>
                    </SelectItem>
                    <SelectItem value="deadline-asc">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Prazo (mais próximo)
                      </div>
                    </SelectItem>
                    <SelectItem value="deadline-desc">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Prazo (mais distante)
                      </div>
                    </SelectItem>
                    <SelectItem value="amount-desc">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor (maior)
                      </div>
                    </SelectItem>
                    <SelectItem value="amount-asc">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor (menor)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Metas */}
          <Card className="card-hover-glow overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Suas Metas
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredAndSortedGoals.length} meta{filteredAndSortedGoals.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <AnimatedLoader variant="wallet" size="md" text="Carregando metas..." />
                </div>
              ) : filteredAndSortedGoals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium">
                    Nenhuma meta encontrada
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Comece adicionando sua primeira meta!
                  </p>
                  <AnimatedButton
                    onClick={openNewGoalForm}
                    variant="gradient"
                    className="mt-4"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Adicionar Meta
                  </AnimatedButton>
                </div>
              ) : (
                <div className="space-y-4 stagger-animation">
                  {filteredAndSortedGoals.map((goal, index) => {
                    const progress = Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100);
                    const daysRemaining = getDaysRemaining(goal.deadline);
                    const CategoryIcon = getCategoryIcon(goal.category);
                    const categoryColor = getCategoryColor(goal.category);
                    const isOverdue = goal.deadline && isPast(parseISO(goal.deadline)) && !goal.completed;
                    
                    return (
                      <div
                        key={goal.id}
                        className={cn(
                          "p-4 rounded-lg border transition-smooth hover:scale-[1.02] cursor-pointer group",
                          goal.completed 
                            ? 'bg-success/5 hover:bg-success/10 border-success/20' 
                            : isOverdue
                            ? 'bg-destructive/5 hover:bg-destructive/10 border-destructive/20'
                            : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center transition-smooth',
                              goal.completed 
                                ? 'bg-success/10 group-hover:bg-success/20' 
                                : isOverdue
                                ? 'bg-destructive/10 group-hover:bg-destructive/20'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                            )}>
                              <CategoryIcon className={cn(
                                'w-5 h-5',
                                goal.completed 
                                  ? 'text-success' 
                                  : isOverdue
                                  ? 'text-destructive'
                                  : 'text-primary'
                              )} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                {goal.title}
                                {goal.completed && (
                                  <Badge className="bg-success/10 text-success border-success/20">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Concluída
                                  </Badge>
                                )}
                                {isOverdue && (
                                  <Badge variant="destructive">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Atrasada
                                  </Badge>
                                )}
                              </h3>
                              {goal.category && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className={`w-2 h-2 rounded-full ${categoryColor}`} />
                                  <span className="text-sm text-muted-foreground">{goal.category}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm text-muted-foreground">Progresso</p>
                              <p className="text-2xl font-bold">
                                {progress}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Valor</p>
                              <p className="font-semibold">
                                {formatCurrency(Number(goal.current_amount))} / {formatCurrency(Number(goal.target_amount))}
                              </p>
                            </div>
                          </div>
                          
                          <Progress 
                            value={progress} 
                            className={cn(
                              "h-3 progress-animate",
                              goal.completed && "bg-success/20",
                              isOverdue && "bg-destructive/20"
                            )}
                          />
                          
                          <div className="flex justify-between items-center">
                            {goal.deadline && (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className={cn(
                                  "text-muted-foreground",
                                  isOverdue && "text-destructive font-medium"
                                )}>
                                  {formatDate(goal.deadline)}
                                </span>
                                {daysRemaining !== null && !goal.completed && (
                                  <span className={cn(
                                    "ml-1",
                                    daysRemaining < 0 ? "text-destructive" : "text-muted-foreground"
                                  )}>
                                    ({daysRemaining < 0 ? `${Math.abs(daysRemaining)} dias atrasada` : `${daysRemaining} dias restantes`})
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {!goal.completed && (
                              <AnimatedButton
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAddProgress(goal)}
                                icon={<Plus className="w-3 h-3" />}
                              >
                                Adicionar Progresso
                              </AnimatedButton>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com Estatísticas e Destaques */}
        <div className="space-y-6">
          {/* Meta em Destaque */}
          {closestGoal && (
            <AnimatedCard 
              variant="glow" 
              className="card-hover-glow"
              icon={<Star className="w-6 h-6 text-yellow-500" />}
              title="Meta em Destaque"
            >
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{closestGoal.title}</h3>
                {closestGoal.category && (
                  <Badge variant="outline" className="w-fit">
                    {closestGoal.category}
                  </Badge>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-medium">
                      {Math.round((Number(closestGoal.current_amount) / Number(closestGoal.target_amount)) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.round((Number(closestGoal.current_amount) / Number(closestGoal.target_amount)) * 100)} 
                    className="h-2 progress-animate" 
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(Number(closestGoal.current_amount))} de {formatCurrency(Number(closestGoal.target_amount))}
                </div>
                
                <AnimatedButton
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenAddProgress(closestGoal)}
                  icon={<Plus className="w-3 h-3" />}
                >
                  Adicionar Progresso
                </AnimatedButton>
              </div>
            </AnimatedCard>
          )}

          {/* Distribuição por Categoria */}
          <AnimatedCard 
            variant="glass" 
            className="card-hover-glow"
            icon={<PieChart className="w-6 h-6 text-primary" />}
            title="Distribuição por Categoria"
          >
            <div className="space-y-3">
              {categoryDistribution.length > 0 ? (
                categoryDistribution.map((category, index) => {
                  const CategoryIcon = getCategoryIcon(category.name);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{category.count} meta(s)</span>
                          <span className="text-sm font-semibold">{category.percentage}%</span>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma meta cadastrada ainda
                </p>
              )}
            </div>
          </AnimatedCard>

          {/* Dicas de Economia */}
          <AnimatedCard 
            variant="glow" 
            className="card-hover-glow"
            icon={<Sparkles className="w-6 h-6 text-accent" />}
            title="Dica do Dia"
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {stats.activeGoals > 0 
                  ? `Você tem ${stats.activeGoals} meta(s) ativa(s). Concentre-se em uma de cada vez para alcançá-las mais rápido!`
                  : "Crie uma nova meta para começar a economizar e alcançar seus sonhos!"
                }
              </p>
              
              {stats.overallProgress > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">
                    Você já economizou {formatCurrency(stats.totalCurrentAmount)}! Continue assim!
                  </span>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Botão Flutuante para Mobile */}
      <Button
        onClick={openNewGoalForm}
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
              {editingGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
            <DialogDescription>
              {editingGoal
                ? 'Edite as informações da sua meta financeira.'
                : 'Preencha as informações para criar uma nova meta financeira.'}
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
            initialData={editingGoal ? {
              title: editingGoal.title,
              target_amount: editingGoal.target_amount.toString(),
              current_amount: editingGoal.current_amount.toString(),
              deadline: editingGoal.deadline ? new Date(editingGoal.deadline) : undefined,
              category: editingGoal.category || ''
            } : undefined}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Progresso */}
      <Dialog open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adicionar Progresso</DialogTitle>
            <DialogDescription>
              Adicione um valor para aumentar o progresso da sua meta.
            </DialogDescription>
          </DialogHeader>
          {goalForProgress && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold">{goalForProgress.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Atual: {formatCurrency(Number(goalForProgress.current_amount))} / {formatCurrency(Number(goalForProgress.target_amount))}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor a adicionar</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="R$ 0,00"
                    value={progressAmount}
                    onChange={(e) => setProgressAmount(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddProgressOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <AnimatedButton
                  onClick={handleAddProgress}
                  loading={addProgressMutation.isPending}
                  className="flex-1"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Adicionar
                </AnimatedButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
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

export default Goals;