import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, User, Wallet, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-primary' },
    { name: 'Transações', href: '/transactions', icon: ArrowLeftRight, color: 'text-success' },
    { name: 'Metas', href: '/goals', icon: Target, color: 'text-secondary' },
    { name: 'Perfil', href: '/profile', icon: User, color: 'text-muted-foreground' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Enhanced Visuals */}
      <header className="gradient-primary text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-12 -mb-12"></div>
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center glow float-animation">
              <Wallet className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              Monetix
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content with Transition */}
      <main className="flex-1 container mx-auto px-4 py-6 animate-fade-in">
        <Outlet />
      </main>

      {/* Bottom Navigation with Enhanced Visuals */}
      <nav className="bg-card/95 backdrop-blur-sm border-t border-border sticky bottom-0 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative group',
                    isActive
                      ? 'text-primary bg-primary/10 scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105'
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <Icon className={cn(
                      "w-5 h-5 transition-smooth",
                      isActive ? "animate-pulse" : "group-hover:animate-bounce"
                    )} />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-smooth",
                    isActive ? "font-semibold" : ""
                  )}>{item.name}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-fade-in"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
