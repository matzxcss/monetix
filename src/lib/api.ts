import { supabase } from './supabase';
import type { Transaction, Goal } from '@/types';
import type { 
  TablesInsert, 
  TablesUpdate, 
  Tables
} from '@/integrations/supabase/types';

// Tipos para as operações de API
export type TransactionInsert = Omit<TablesInsert<'transactions'>, 'id' | 'created_at'>;
export type TransactionUpdate = TablesUpdate<'transactions'>;
export type TransactionRow = Tables<'transactions'>;

export type GoalInsert = Omit<TablesInsert<'goals'>, 'id' | 'created_at'>;
export type GoalUpdate = TablesUpdate<'goals'>;
export type GoalRow = Tables<'goals'>;

// Tipos para filtros de transações
export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Classe de erro personalizada para operações da API
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função utilitária para tratamento de erros
const handleApiError = (error: Error | { message?: string; code?: string; details?: Record<string, unknown> }): ApiError => {
  if ('code' in error && error.code) {
    return new ApiError(
      error.message || 'Erro desconhecido',
      error.code,
      'details' in error ? error.details : undefined
    );
  }
  return new ApiError(error?.message || 'Erro ao processar requisição');
};

// Serviços de API para Transações
export const transactionApi = {
  /**
   * Cria uma nova transação
   * @param transaction Dados da transação a ser criada
   * @returns Promise com a transação criada ou erro
   */
  async createTransaction(transaction: TransactionInsert): Promise<ApiResponse<TransactionRow>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Lista transações com filtros opcionais
   * @param userId ID do usuário para filtrar transações
   * @param filters Filtros opcionais para a consulta
   * @returns Promise com a lista de transações ou erro
   */
  async getTransactions(
    userId: string, 
    filters: TransactionFilters = {}
  ): Promise<ApiResponse<TransactionRow[]>> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Atualiza uma transação existente
   * @param id ID da transação a ser atualizada
   * @param updates Dados a serem atualizados
   * @returns Promise com a transação atualizada ou erro
   */
  async updateTransaction(
    id: string, 
    updates: TransactionUpdate
  ): Promise<ApiResponse<TransactionRow>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Exclui uma transação
   * @param id ID da transação a ser excluída
   * @returns Promise indicando sucesso ou erro
   */
  async deleteTransaction(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Obtém uma transação específica por ID
   * @param id ID da transação
   * @returns Promise com a transação ou erro
   */
  async getTransactionById(id: string): Promise<ApiResponse<TransactionRow>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  }
};

// Serviços de API para Metas
export const goalApi = {
  /**
   * Cria uma nova meta
   * @param goal Dados da meta a ser criada
   * @returns Promise com a meta criada ou erro
   */
  async createGoal(goal: GoalInsert): Promise<ApiResponse<GoalRow>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Lista metas de um usuário
   * @param userId ID do usuário para filtrar metas
   * @returns Promise com a lista de metas ou erro
   */
  async getGoals(userId: string): Promise<ApiResponse<GoalRow[]>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Atualiza uma meta existente
   * @param id ID da meta a ser atualizada
   * @param updates Dados a serem atualizados
   * @returns Promise com a meta atualizada ou erro
   */
  async updateGoal(
    id: string, 
    updates: GoalUpdate
  ): Promise<ApiResponse<GoalRow>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Exclui uma meta
   * @param id ID da meta a ser excluída
   * @returns Promise indicando sucesso ou erro
   */
  async deleteGoal(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Atualiza o progresso de uma meta
   * @param id ID da meta
   * @param amount Valor a ser adicionado ao progresso atual
   * @returns Promise com a meta atualizada ou erro
   */
  async updateGoalProgress(
    id: string, 
    amount: number
  ): Promise<ApiResponse<GoalRow>> {
    try {
      // Primeiro, obtemos a meta atual
      const { data: currentGoal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount, target_amount')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Calculamos o novo valor
      const newAmount = currentGoal.current_amount + amount;
      const isCompleted = newAmount >= currentGoal.target_amount;

      // Atualizamos a meta com o novo progresso
      const { data, error } = await supabase
        .from('goals')
        .update({
          current_amount: newAmount,
          completed: isCompleted
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  },

  /**
   * Obtém uma meta específica por ID
   * @param id ID da meta
   * @returns Promise com a meta ou erro
   */
  async getGoalById(id: string): Promise<ApiResponse<GoalRow>> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      const apiError = handleApiError(error);
      return {
        data: null,
        error: apiError.message,
        success: false
      };
    }
  }
};

// Exportações padrão para facilitar o uso
export default {
  transactions: transactionApi,
  goals: goalApi
};