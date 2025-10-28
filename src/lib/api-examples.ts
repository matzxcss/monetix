/**
 * Exemplos de como usar os serviços de API criados em src/lib/api.ts
 * Este arquivo serve como documentação e referência para os desenvolvedores
 */

import { transactionApi, goalApi, type TransactionFilters } from './api';

// Exemplo de como criar uma nova transação
export async function createTransactionExample() {
  const userId = 'user-id-here'; // Obter do contexto de autenticação
  
  const newTransaction = {
    user_id: userId,
    amount: 150.50,
    type: 'expense' as const,
    category: 'Alimentação',
    description: 'Jantar no restaurante',
    date: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
  };

  const result = await transactionApi.createTransaction(newTransaction);
  
  if (result.success) {
    console.log('Transação criada:', result.data);
    return result.data;
  } else {
    console.error('Erro ao criar transação:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como listar transações com filtros
export async function getTransactionsExample() {
  const userId = 'user-id-here'; // Obter do contexto de autenticação
  
  const filters: TransactionFilters = {
    type: 'expense',
    category: 'Alimentação',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    limit: 10
  };

  const result = await transactionApi.getTransactions(userId, filters);
  
  if (result.success) {
    console.log('Transações encontradas:', result.data);
    return result.data;
  } else {
    console.error('Erro ao obter transações:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como atualizar uma transação
export async function updateTransactionExample(transactionId: string) {
  const updates = {
    amount: 200.00,
    description: 'Jantar no restaurante (atualizado)'
  };

  const result = await transactionApi.updateTransaction(transactionId, updates);
  
  if (result.success) {
    console.log('Transação atualizada:', result.data);
    return result.data;
  } else {
    console.error('Erro ao atualizar transação:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como excluir uma transação
export async function deleteTransactionExample(transactionId: string) {
  const result = await transactionApi.deleteTransaction(transactionId);
  
  if (result.success) {
    console.log('Transação excluída com sucesso');
    return true;
  } else {
    console.error('Erro ao excluir transação:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como criar uma nova meta
export async function createGoalExample() {
  const userId = 'user-id-here'; // Obter do contexto de autenticação
  
  const newGoal = {
    user_id: userId,
    title: 'Viagem para a praia',
    target_amount: 3000.00,
    current_amount: 500.00,
    deadline: '2024-07-15',
    category: 'Lazer'
  };

  const result = await goalApi.createGoal(newGoal);
  
  if (result.success) {
    console.log('Meta criada:', result.data);
    return result.data;
  } else {
    console.error('Erro ao criar meta:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como listar metas
export async function getGoalsExample() {
  const userId = 'user-id-here'; // Obter do contexto de autenticação

  const result = await goalApi.getGoals(userId);
  
  if (result.success) {
    console.log('Metas encontradas:', result.data);
    return result.data;
  } else {
    console.error('Erro ao obter metas:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como atualizar uma meta
export async function updateGoalExample(goalId: string) {
  const updates = {
    title: 'Viagem para a praia (atualizado)',
    target_amount: 3500.00
  };

  const result = await goalApi.updateGoal(goalId, updates);
  
  if (result.success) {
    console.log('Meta atualizada:', result.data);
    return result.data;
  } else {
    console.error('Erro ao atualizar meta:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como atualizar o progresso de uma meta
export async function updateGoalProgressExample(goalId: string) {
  const additionalAmount = 200.00; // Valor a ser adicionado ao progresso

  const result = await goalApi.updateGoalProgress(goalId, additionalAmount);
  
  if (result.success) {
    console.log('Progresso da meta atualizado:', result.data);
    return result.data;
  } else {
    console.error('Erro ao atualizar progresso da meta:', result.error);
    throw new Error(result.error);
  }
}

// Exemplo de como excluir uma meta
export async function deleteGoalExample(goalId: string) {
  const result = await goalApi.deleteGoal(goalId);
  
  if (result.success) {
    console.log('Meta excluída com sucesso');
    return true;
  } else {
    console.error('Erro ao excluir meta:', result.error);
    throw new Error(result.error);
  }
}

// Hook personalizado React para uso em componentes (exemplo)
/*
import { useState, useEffect } from 'react';
import { transactionApi, goalApi } from './api';

export function useTransactions(userId: string, filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const result = await transactionApi.getTransactions(userId, filters);
        
        if (result.success) {
          setTransactions(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchTransactions();
    }
  }, [userId, JSON.stringify(filters)]);

  return { transactions, loading, error };
}

export function useGoals(userId: string) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const result = await goalApi.getGoals(userId);
        
        if (result.success) {
          setGoals(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchGoals();
    }
  }, [userId]);

  return { goals, loading, error };
}
*/