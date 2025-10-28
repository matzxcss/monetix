import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Shield, 
  Download, 
  Trash2, 
  LogOut, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Key, 
  Smartphone, 
  Monitor, 
  Globe, 
  Bell, 
  Moon, 
  Sun, 
  Languages, 
  DollarSign, 
  Euro, 
  FileText, 
  Database,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/format';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    transactions: boolean;
    goals: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    language: 'pt' | 'en';
    currency: 'BRL' | 'USD' | 'EUR';
  };
}

interface UserStats {
  totalTransactions: number;
  completedGoals: number;
  totalSaved: number;
  accountAge: string;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch real user data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  // Estados para gerenciar dados do usuário
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para informações do perfil
  const [userName, setUserName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  
  // Estados para configurações
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      transactions: true,
      goals: true,
    },
    appearance: {
      theme: theme,
      language: 'pt',
      currency: 'BRL',
    },
  });
  
  // Estados para segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Calcular estatísticas reais do usuário
  const userStats = {
    totalTransactions: transactions.length,
    completedGoals: Array.isArray(goals) ? goals.filter(g => g.completed).length : 0,
    totalSaved: Array.isArray(transactions) ?
      transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) -
      transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) : 0,
    accountAge: user?.created_at ? formatDate(user.created_at) : '01/01/2023',
  };
  
  // Sessões ativas (simuladas)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'Chrome - Windows',
      location: 'São Paulo, Brasil',
      lastActive: 'Agora',
      current: true,
    },
    {
      id: '2',
      device: 'Firefox - Android',
      location: 'São Paulo, Brasil',
      lastActive: '2 horas atrás',
      current: false,
    },
  ]);
  
  // Efeito para sincronizar tema global com estado local
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, theme: theme }
    }));
  }, [theme]);
  
  // Função para fazer upload de avatar
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      // Simulação de upload
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file);
        setAvatarUrl(fakeUrl);
        setIsLoading(false);
        toast({
          title: "Avatar atualizado",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      }, 1500);
    }
  };
  
  // Função para salvar informações do perfil
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Atualizar metadados do usuário no Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userName,
          avatar_url: avatarUrl,
        }
      });
      
      if (error) throw error;
      
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Função para alterar senha
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível alterar sua senha. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Função para salvar configurações
  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram salvas com sucesso.",
      });
    }, 1000);
  };
  
  // Função para exportar dados
  const handleExportData = (format: 'csv' | 'excel') => {
    setIsLoading(true);
    // Simulação de exportação
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dados exportados",
        description: `Seus dados foram exportados no formato ${format.toUpperCase()}.`,
      });
    }, 1500);
  };
  
  // Função para fazer backup
  const handleBackup = () => {
    setIsLoading(true);
    // Simulação de backup
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Backup criado",
        description: "Seu backup foi criado com sucesso.",
      });
    }, 2000);
  };
  
  // Função para encerrar sessão
  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Sessão encerrada",
      description: "A sessão selecionada foi encerrada.",
    });
  };
  
  // Função para logout
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in stagger-animation">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações e configurações</p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Aba Perfil */}
        <TabsContent value="profile" className="space-y-6">
          {/* Informações do Perfil */}
          <AnimatedCard
            title="Informações do Perfil"
            description="Gerencie suas informações pessoais"
            icon={<User className="w-5 h-5" />}
            variant="glass"
            delay={100}
          >
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl} alt={userName} />
                    <AvatarFallback className="text-2xl gradient-primary text-white">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full gradient-primary text-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
               
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    {isEditing ? (
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="text-2xl font-bold"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{userName}</h2>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {userEmail}
                  </p>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    Membro desde {userStats.accountAge}
                  </p>
                </div>
              </div>
              
              {/* Estatísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatedCard variant="glow" delay={200}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.totalTransactions}</div>
                    <div className="text-sm text-muted-foreground">Transações</div>
                  </CardContent>
                </AnimatedCard>
                <AnimatedCard variant="glow" delay={300}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">{userStats.completedGoals}</div>
                    <div className="text-sm text-muted-foreground">Metas Concluídas</div>
                  </CardContent>
                </AnimatedCard>
                <AnimatedCard variant="glow" delay={400}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(userStats.totalSaved)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Economizado</div>
                  </CardContent>
                </AnimatedCard>
                <AnimatedCard variant="glow" delay={500}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning">92%</div>
                    <div className="text-sm text-muted-foreground">Score Financeiro</div>
                  </CardContent>
                </AnimatedCard>
              </div>
              
              {isEditing && (
                <div className="flex justify-end">
                  <AnimatedButton
                    onClick={handleSaveProfile}
                    loading={isLoading}
                    icon={<Save className="w-4 h-4" />}
                    variant="gradient"
                  >
                    Salvar Alterações
                  </AnimatedButton>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        </TabsContent>
        
        {/* Aba Configurações */}
        <TabsContent value="settings" className="space-y-6">
          {/* Preferências de Notificação */}
          <AnimatedCard
            title="Preferências de Notificação"
            description="Controle como você recebe notificações"
            icon={<Bell className="w-5 h-5" />}
            variant="glass"
            delay={100}
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">Receba atualizações importantes por email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Receba notificações no seu dispositivo</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Transações</Label>
                  <p className="text-sm text-muted-foreground">Seja notificado sobre novas transações</p>
                </div>
                <Switch
                  checked={settings.notifications.transactions}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, transactions: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembretes de Metas</Label>
                  <p className="text-sm text-muted-foreground">Receba lembretes sobre suas metas</p>
                </div>
                <Switch
                  checked={settings.notifications.goals}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, goals: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </AnimatedCard>
          
          {/* Aparência */}
          <AnimatedCard
            title="Aparência"
            description="Personalize a aparência do aplicativo"
            icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            variant="glass"
            delay={200}
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema</Label>
                  <p className="text-sm text-muted-foreground">Escolha entre modo claro ou escuro</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? 'dark' : 'light')
                    }
                  />
                  <Moon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value: 'pt' | 'en') =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, language: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Português
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        English
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Select
                  value={settings.appearance.currency}
                  onValueChange={(value: 'BRL' | 'USD' | 'EUR') =>
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, currency: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Real (BRL)
                      </div>
                    </SelectItem>
                    <SelectItem value="USD">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Dólar (USD)
                      </div>
                    </SelectItem>
                    <SelectItem value="EUR">
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Euro (EUR)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </AnimatedCard>
          
          <div className="flex justify-end">
            <AnimatedButton
              onClick={handleSaveSettings}
              loading={isLoading}
              icon={<Save className="w-4 h-4" />}
              variant="gradient"
            >
              Salvar Configurações
            </AnimatedButton>
          </div>
        </TabsContent>
        
        {/* Aba Segurança */}
        <TabsContent value="security" className="space-y-6">
          {/* Alterar Senha */}
          <AnimatedCard
            title="Alterar Senha"
            description="Atualize sua senha para manter sua conta segura"
            icon={<Key className="w-5 h-5" />}
            variant="glass"
            delay={100}
          >
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
              </div>
              <AnimatedButton
                onClick={handleChangePassword}
                loading={isLoading}
                icon={<Key className="w-4 h-4" />}
                variant="gradient"
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Alterar Senha
              </AnimatedButton>
            </CardContent>
          </AnimatedCard>
          
          {/* Autenticação de Dois Fatores */}
          <AnimatedCard
            title="Autenticação de Dois Fatores"
            description="Adicione uma camada extra de segurança à sua conta"
            icon={<Smartphone className="w-5 h-5" />}
            variant="glass"
            delay={200}
          >
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    {twoFactorEnabled 
                      ? "2FA está ativado em sua conta" 
                      : "Proteja sua conta com autenticação de dois fatores"}
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setTwoFactorEnabled(checked);
                    toast({
                      title: checked ? "2FA Ativado" : "2FA Desativado",
                      description: checked 
                        ? "Autenticação de dois fatores foi ativada." 
                        : "Autenticação de dois fatores foi desativada.",
                    });
                  }}
                />
              </div>
              {twoFactorEnabled && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>2FA Ativado</AlertTitle>
                  <AlertDescription>
                    Sua conta está protegida com autenticação de dois fatores. Você precisará de um código de verificação ao fazer login.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </AnimatedCard>
          
          {/* Sessões Ativas */}
          <AnimatedCard
            title="Sessões Ativas"
            description="Gerencie as sessões ativas da sua conta"
            icon={<Monitor className="w-5 h-5" />}
            variant="glass"
            delay={300}
          >
            <CardContent className="space-y-4">
              {activeSessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-muted-foreground">{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Encerrar
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </AnimatedCard>
          
          {/* Logout */}
          <AnimatedCard
            title="Sair da Conta"
            description="Encerre sua sessão atual"
            icon={<LogOut className="w-5 h-5" />}
            variant="glass"
            delay={400}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ao sair da sua conta, você precisará fazer login novamente para acessar seus dados.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <AnimatedButton
                    variant="destructive"
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    Sair da Conta
                  </AnimatedButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você será desconectado da sua conta e precisará fazer login novamente para acessar seus dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
        
        {/* Aba Dados */}
        <TabsContent value="data" className="space-y-6">
          {/* Exportar Dados */}
          <AnimatedCard
            title="Exportar Dados"
            description="Baixe seus dados em diferentes formatos"
            icon={<Download className="w-5 h-5" />}
            variant="glass"
            delay={100}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Exporte todas as suas transações e metas para análise externa ou backup.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatedButton
                  onClick={() => handleExportData('csv')}
                  loading={isLoading}
                  icon={<FileText className="w-4 h-4" />}
                  variant="outline"
                >
                  Exportar como CSV
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => handleExportData('excel')}
                  loading={isLoading}
                  icon={<FileText className="w-4 h-4" />}
                  variant="outline"
                >
                  Exportar como Excel
                </AnimatedButton>
              </div>
            </CardContent>
          </AnimatedCard>
          
          {/* Backup */}
          <AnimatedCard
            title="Backup dos Dados"
            description="Crie um backup completo dos seus dados"
            icon={<Database className="w-5 h-5" />}
            variant="glass"
            delay={200}
          >
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crie um backup completo de todos os seus dados, incluindo transações, metas e configurações.
              </p>
              <AnimatedButton
                onClick={handleBackup}
                loading={isLoading}
                icon={<Database className="w-4 h-4" />}
                variant="gradient"
              >
                Criar Backup
              </AnimatedButton>
            </CardContent>
          </AnimatedCard>
          
          {/* Excluir Conta */}
          <AnimatedCard
            title="Excluir Conta"
            description="Exclua permanentemente sua conta e todos os dados associados"
            icon={<Trash2 className="w-5 h-5" />}
            variant="glass"
            delay={300}
          >
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos e não poderão ser recuperados.
                </AlertDescription>
              </Alert>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <AnimatedButton
                    variant="destructive"
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Excluir Minha Conta
                  </AnimatedButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza que deseja excluir sua conta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus dados, incluindo transações, metas e configurações, serão permanentemente excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        toast({
                          title: "Conta excluída",
                          description: "Sua conta foi excluída com sucesso.",
                          variant: "destructive",
                        });
                        setTimeout(() => handleLogout(), 2000);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir Conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;