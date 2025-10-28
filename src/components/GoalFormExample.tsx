import React, { useState } from 'react';
import GoalForm, { GoalFormValues } from './GoalForm';
import { goalApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Exemplo de uso do componente GoalForm
const GoalFormExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const { toast } = useToast();

  // Dados iniciais para modo de edição
  const initialData: Partial<GoalFormValues> = {
    title: 'Viagem para a Europa',
    target_amount: 'R$ 15.000,00',
    current_amount: 'R$ 7.500,00',
    deadline: new Date('2024-12-31'),
    category: 'Viagem',
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);
    
    try {
      // Converte os valores para o formato esperado pela API
      const goalData = {
        title: data.title,
        target_amount: parseFloat(data.target_amount.replace('R$', '').replace(/\./g, '').replace(',', '.')),
        current_amount: parseFloat(data.current_amount.replace('R$', '').replace(/\./g, '').replace(',', '.')),
        deadline: data.deadline?.toISOString().split('T')[0],
        category: data.category,
        user_id: 'user-id-exemplo', // Em um app real, viria do contexto de autenticação
      };

      let response;
      
      if (isEditing && currentGoalId) {
        // Atualiza meta existente
        response = await goalApi.updateGoal(currentGoalId, goalData);
      } else {
        // Cria nova meta
        response = await goalApi.createGoal(goalData);
      }

      if (response.success) {
        toast({
          title: isEditing ? 'Meta atualizada!' : 'Meta criada!',
          description: `Sua meta "${data.title}" foi ${isEditing ? 'atualizada' : 'criada'} com sucesso.`,
        });
        
        // Resetar formulário após sucesso
        if (!isEditing) {
          setIsEditing(false);
          setCurrentGoalId(null);
        }
      } else {
        toast({
          title: 'Erro!',
          description: response.error || 'Ocorreu um erro ao salvar a meta.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alternar entre modo de criação e edição
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setCurrentGoalId(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gradient">Demonstração do GoalForm</h1>
          <p className="text-muted-foreground">
            Componente de formulário para criação e edição de metas financeiras
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={toggleEditMode}
            className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-smooth"
          >
            {isEditing ? 'Modo: Criar Nova Meta' : 'Modo: Editar Meta Existente'}
          </button>
        </div>

        <GoalForm
          onSubmit={handleSubmit}
          initialData={isEditing ? initialData : undefined}
          isLoading={isLoading}
          title={isEditing ? 'Editar Meta' : 'Nova Meta'}
        />

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recursos Demonstrados</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Validação de campos obrigatórios e valores</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Formatação automática de valores monetários</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Visual de progresso animado</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Confetes animados quando meta é alcançada</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Feedback visual de loading e sucesso</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Design responsivo e acessível</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Identidade visual Monetix (verde petróleo, laranja queimado)</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Como Usar</h2>
          <pre className="text-sm bg-background p-4 rounded-md overflow-x-auto">
{`import GoalForm, { GoalFormValues } from '@/components/GoalForm';

const MyComponent = () => {
  const handleSubmit = (data: GoalFormValues) => {
    // Processar dados do formulário
    console.log(data);
  };

  return (
    <GoalForm
      onSubmit={handleSubmit}
      title="Nova Meta"
      isLoading={false}
      // initialData para modo de edição
      initialData={{
        title: "Minha Meta",
        target_amount: "R$ 1000,00",
        current_amount: "R$ 500,00",
        deadline: new Date(),
        category: "Categoria"
      }}
    />
  );
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GoalFormExample;