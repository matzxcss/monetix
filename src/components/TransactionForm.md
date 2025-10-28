# TransactionForm Component

## Descrição

O componente `TransactionForm` é um formulário completo e responsivo para adicionar e editar transações financeiras no aplicativo Monetix. Ele oferece uma experiência de usuário intuitiva com validações robustas, feedback visual e animações suaves.

## Características

- ✅ Formulário completo com todos os campos necessários
- ✅ Validação robusta com Zod e React Hook Form
- ✅ Formatação automática de moeda brasileira
- ✅ Botões toggle para tipo de transação (Receita/Despesa)
- ✅ Seletor de data com valor padrão (hoje)
- ✅ Dropdown de categorias filtradas por tipo
- ✅ Feedback visual (loading, sucesso, erro)
- ✅ Animações suaves e efeitos visuais
- ✅ Totalmente responsivo para mobile
- ✅ Identidade visual Monetix (cores verde petróleo e laranja queimado)

## Props

| Prop | Tipo | Descrição | Padrão |
|------|------|-----------|--------|
| `onSubmit` | `(data: TransactionFormValues) => void` | Função chamada ao submeter o formulário | Obrigatório |
| `initialData` | `Partial<TransactionFormValues>` | Dados iniciais para modo de edição | Opcional |
| `isLoading` | `boolean` | Estado de loading do formulário | `false` |
| `title` | `string` | Título do formulário | `"Nova Transação"` |
| `successMessage` | `string` | Mensagem de sucesso a ser exibida | Opcional |
| `errorMessage` | `string` | Mensagem de erro a ser exibida | Opcional |

## Tipo TransactionFormValues

```typescript
interface TransactionFormValues {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description?: string;
  date: Date;
}
```

## Exemplo de Uso

```tsx
import React, { useState } from 'react';
import TransactionForm, { TransactionFormValues } from '@/components/TransactionForm';

const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Converte o valor formatado para número
      const numericAmount = parseFloat(data.amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
      
      // Prepara os dados para a API
      const transactionData = {
        ...data,
        amount: numericAmount,
      };
      
      // Envia para a API
      await api.createTransaction(transactionData);
      
      setSuccessMessage('Transação salva com sucesso!');
    } catch (error) {
      setErrorMessage('Erro ao salvar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      title="Nova Transação"
      successMessage={successMessage}
      errorMessage={errorMessage}
    />
  );
};
```

## Modo de Edição

Para usar o formulário em modo de edição, basta fornecer os dados iniciais através da prop `initialData`:

```tsx
const initialData = {
  type: 'expense' as const,
  amount: '150,50',
  category: 'Alimentação',
  description: 'Almoço com amigos',
  date: new Date(),
};

<TransactionForm
  onSubmit={handleSubmit}
  initialData={initialData}
  title="Editar Transação"
/>
```

## Validações

O formulário inclui as seguintes validações:

- **Tipo**: Campo obrigatório (income/expense)
- **Valor**: Obrigatório e maior que R$ 0,00
- **Categoria**: Campo obrigatório
- **Data**: Campo obrigatório
- **Descrição**: Campo opcional

## Animações e Efeitos

O componente utiliza as seguintes classes de animação:

- `card-hover-glow`: Efeito de brilho ao passar o mouse sobre o card
- `transition-smooth`: Transições suaves em todos os elementos interativos
- `btn-bounce`: Efeito de bounce ao clicar nos botões

## Responsividade

O formulário é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- **Desktop**: Layout com largura máxima de 448px (max-w-md)
- **Tablet**: Ajuste automático de espaçamento e tamanho
- **Mobile**: Layout otimizado para telas pequenas com toque facilitado

## Integração com API

O componente foi projetado para integrar-se facilmente com os serviços de API existentes em `src/lib/api.ts`. Ao submeter o formulário, os dados são formatados e podem ser enviados diretamente para as funções da API:

```tsx
import { transactionApi } from '@/lib/api';

const handleSubmit = async (data: TransactionFormValues) => {
  const numericAmount = parseFloat(data.amount.replace('R$', '').replace(/\./g, '').replace(',', '.'));
  
  const transactionData = {
    type: data.type,
    amount: numericAmount,
    category: data.category,
    description: data.description,
    date: data.date.toISOString().split('T')[0],
    user_id: getCurrentUserId(), // Implemente esta função
  };
  
  const response = await transactionApi.createTransaction(transactionData);
  
  if (response.success) {
    // Tratar sucesso
  } else {
    // Tratar erro
  }
};
```

## Personalização

O componente pode ser personalizado através das props e classes CSS:

- Altere o título através da prop `title`
- Modifique as mensagens de feedback através das props `successMessage` e `errorMessage`
- Ajuste as animações modificando as classes CSS em `src/index.css`
- Personalize as cores através das variáveis CSS no arquivo `tailwind.config.ts`