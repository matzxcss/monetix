export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  category?: string;
  completed: boolean;
  created_at: string;
}

export interface CategoryIcon {
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryIcon[] = [
  { name: 'Alimentação', icon: 'UtensilsCrossed', color: 'hsl(var(--success))' },
  { name: 'Transporte', icon: 'Car', color: 'hsl(var(--primary))' },
  { name: 'Moradia', icon: 'Home', color: 'hsl(var(--secondary))' },
  { name: 'Saúde', icon: 'HeartPulse', color: 'hsl(var(--destructive))' },
  { name: 'Educação', icon: 'GraduationCap', color: 'hsl(var(--accent))' },
  { name: 'Lazer', icon: 'Gamepad2', color: 'hsl(var(--warning))' },
  { name: 'Investimentos', icon: 'TrendingUp', color: 'hsl(var(--success))' },
  { name: 'Salário', icon: 'Wallet', color: 'hsl(var(--primary))' },
  { name: 'Freelance', icon: 'Briefcase', color: 'hsl(var(--secondary))' },
  { name: 'Vendas', icon: 'TrendingUp', color: 'hsl(var(--success))' },
  { name: 'Material', icon: 'ShoppingCart', color: 'hsl(var(--destructive))' },
  { name: 'Outros', icon: 'MoreHorizontal', color: 'hsl(var(--muted-foreground))' },
];
