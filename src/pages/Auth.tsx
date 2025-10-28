import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedLoader from '@/components/ui/animated-loader';
import ParticleEffect from '@/components/ui/particle-effect';
import { Wallet, ArrowRight, TrendingUp, Target, Sparkles, Shield, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error('Erro ao processar. Tente novamente.');
        }
      } else if (!isLogin) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden">
      {/* Background Particle Effect */}
      <div className="absolute inset-0 opacity-20">
        <ParticleEffect variant="bubbles" particleCount={30} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Brand Section with Enhanced Visuals */}
        <div className="text-white space-y-8 animate-fade-in-left">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/25 backdrop-blur-xl flex items-center justify-center glow-animation shadow-2xl">
              <Wallet className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl font-heading font-bold text-gradient bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                Monetix
              </h1>
              <p className="text-white/70 text-sm font-medium">Sua Inteligência Financeira</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-heading font-bold leading-tight">
              Inteligência Financeira ao seu <span className="text-secondary font-bold">Alcance</span>
            </h2>
            
            <p className="text-white/90 text-lg leading-relaxed">
              Transforme seus dados em insights e tome decisões melhores para alcançar seus objetivos financeiros com tecnologia de ponta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 group transition-all duration-300 hover:translate-x-2 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                  <TrendingUp className="w-6 h-6 group-hover:animate-bounce" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1 flex items-center gap-2 text-lg">
                    Controle Total
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-white/80 text-sm">Visualize todas suas transações em um só lugar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 group transition-all duration-300 hover:translate-x-2 hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                  <Target className="w-6 h-6 group-hover:animate-bounce" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1 flex items-center gap-2 text-lg">
                    Metas Inteligentes
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-white/80 text-sm">Crie objetivos e acompanhe seu progresso</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form with Enhanced Visuals */}
        <div className="relative">
          {/* Floating Orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          
          <Card className="relative backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-50 blur-xl group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="absolute inset-0 border-2 border-white/20 rounded-2xl"></div>
            
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-2xl"></div>
            
            <CardHeader className="relative pb-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-pulse">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-heading text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
              </CardTitle>
              <CardDescription className="text-center text-white/80 text-base">
                {isLogin
                  ? 'Entre com suas credenciais para acessar sua conta'
                  : 'Preencha os dados abaixo para começar sua jornada'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="flex items-center gap-3 text-white font-medium">
                    <Mail className="w-4 h-4" />
                    Email
                    <Lock className="w-3 h-3 text-white/60" />
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </div>
                
                {/* Password Input */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="flex items-center gap-3 text-white font-medium">
                    <Lock className="w-4 h-4" />
                    Senha
                    <Lock className="w-3 h-3 text-white/60" />
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 transition-all duration-300 backdrop-blur-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-heading font-semibold py-4 text-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-105 relative overflow-hidden group"
                  size="lg"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {loading ? (
                    <>
                      <AnimatedLoader variant="dots" size="sm" className="text-white" />
                      <span className="ml-3">Processando...</span>
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Toggle Link */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white/80 hover:text-white hover:underline transition-all duration-300 font-medium text-base"
                  >
                    {isLogin ? '🚀 Não tem conta? Cadastre-se agora' : '🔑 Já tem conta? Entre aqui'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
