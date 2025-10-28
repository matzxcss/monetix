import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import { TransactionFormValues } from './TransactionForm';

const TransactionFormExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulando sucesso
      console.log('Dados da transação:', data);
      setSuccessMessage('Transação salva com sucesso!');
      
      // Ocultar o formulário após 3 segundos
      setTimeout(() => {
        setShowForm(false);
      }, 3000);
    } catch (error) {
      // Simulando erro
      setErrorMessage('Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowForm(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Dados iniciais para modo de edição
  const initialData = {
    type: 'expense' as const,
    amount: '150,50',
    category: 'Alimentação',
    description: 'Almoço com amigos',
    date: new Date(),
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">
          Exemplo de Formulário de Transação
        </h1>
        
        {showForm ? (
          <TransactionForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isLoading={isLoading}
            title="Nova Transação"
            successMessage={successMessage}
            errorMessage={errorMessage}
          />
        ) : (
          <div className="text-center p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Transação Criada com Sucesso!
            </h2>
            <p className="text-muted-foreground mb-6">
              Sua transação foi salva e está disponível no seu extrato.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Criar Nova Transação
            </button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Instruções de Uso:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Selecione o tipo de transação (Receita/Despesa)</li>
            <li>• Digite o valor com formatação automática de moeda</li>
            <li>• Escolha uma categoria (filtrada por tipo)</li>
            <li>• Selecione a data da transação</li>
            <li>• Adicione uma descrição opcional</li>
            <li>• Clique em "Salvar Transação"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormExample;