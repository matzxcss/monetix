# GoalForm Component

## Descrição

O componente `GoalForm` é um formulário completo para criação e edição de metas financeiras no aplicativo Monetix. Ele oferece uma interface intuitiva com validações robustas, feedback visual em tempo real e animações aprimoradas para uma experiência de usuário excepcional.

## Funcionalidades

### 🎯 Campos do Formulário

- **Título da Meta**: Campo de texto obrigatório para nomear a meta
- **Valor Alvo**: Campo numérico com formatação automática de moeda brasileira
- **Valor Atual**: Campo numérico com formatação de moeda (padrão: R$ 0,00)
- **Data Limite**: Seletor de data opcional com validação para datas futuras
- **Categoria**: Campo de texto opcional para categorizar a meta

### ✅ Validações Implementadas

- Título é obrigatório
- Valor alvo é obrigatório e deve ser maior que 0
- Valor atual deve ser maior ou igual a 0
- Data limite deve ser futura (se informada)
- Valor atual não pode ser maior que o valor alvo

### 📊 Visual de Progresso

- Barra de progresso animada mostrando o percentual atual
- Texto informativo com valores formatados
- Indicador visual quando a meta é alcançada
- Confetes animados quando a meta é concluída

### 🎨 Design e Animações

- Classes de animação: `card-hover-glow`, `transition-smooth`, `btn-bounce`, `progress-animate`
- Feedback visual de loading e sucesso
- Animações nos campos ao focar
- Confetes animados quando meta é alcançada

### 🎨 Identidade Visual Monetix

- Cores da marca: verde petróleo (#008080) e laranja queimado (#CC5500)
- Tipografia: Montserrat para títulos, Roboto para textos
- Ícones consistentes: Target, PiggyBank, Calendar, etc.

## Uso

### Importação

```typescript
import GoalForm, { GoalFormValues } from '@/components/GoalForm';
```

### Exemplo Básico

```typescript
import React from 'react';
import GoalForm, { GoalFormValues } from '@/components/GoalForm';

const MyComponent = () => {
  const handleSubmit = (data: GoalFormValues) => {
    // Processar dados do formulário
    console.log('Dados da meta:', data);
  };

  return (
    <GoalForm
      onSubmit={handleSubmit}
      title="Nova Meta Financeira"
      isLoading={false}
    />
  );
};
```

### Exemplo com Modo de Edição

```typescript
import React from 'react';
import GoalForm, { GoalFormValues } from '@/components/GoalForm';

const EditGoalComponent = () => {
  const initialData: Partial<GoalFormValues> = {
    title: 'Viagem para a Europa',
    target_amount: 'R$ 15.000,00',
    current_amount: 'R$ 7.500,00',
    deadline: new Date('2024-12-31'),
    category: 'Viagem',
  };

  const handleSubmit = (data: GoalFormValues) => {
    // Atualizar meta existente
    console.log('Meta atualizada:', data);
  };

  return (
    <GoalForm
      onSubmit={handleSubmit}
      title="Editar Meta"
      initialData={initialData}
      isLoading={false}
    />
  );
};
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `onSubmit` | `(data: GoalFormValues) => void` | - | Função callback chamada ao submeter o formulário |
| `initialData` | `Partial<GoalFormValues>` | `undefined` | Dados iniciais para modo de edição |
| `isLoading` | `boolean` | `false` | Estado de loading durante o envio |
| `title` | `string` | `'Nova Meta'` | Título exibido no formulário |

## Tipo GoalFormValues

```typescript
interface GoalFormValues {
  title: string;
  target_amount: string; // Formatado como "R$ 1.234,56"
  current_amount: string; // Formatado como "R$ 1.234,56"
  deadline?: Date;
  category?: string;
}
```

## Integração com API

O componente foi projetado para integrar-se facilmente com os serviços de API do Monetix:

```typescript
import { goalApi } from '@/lib/api';

const handleSubmit = async (data: GoalFormValues) => {
  // Converter valores formatados para números
  const goalData = {
    title: data.title,
    target_amount: parseFloat(data.target_amount.replace('R$', '').replace(/\./g, '').replace(',', '.')),
    current_amount: parseFloat(data.current_amount.replace('R$', '').replace(/\./g, '').replace(',', '.')),
    deadline: data.deadline?.toISOString().split('T')[0],
    category: data.category,
    user_id: 'user-id',
  };

  // Criar ou atualizar meta
  const response = await goalApi.createGoal(goalData);
  // ou
  // const response = await goalApi.updateGoal(goalId, goalData);
  
  if (response.success) {
    // Meta salva com sucesso
  } else {
    // Tratar erro
  }
};
```

## Acessibilidade

- Suporte completo para navegação por teclado
- Labels semânticos para todos os campos
- Feedback visual e textual para estados de erro
- Contraste adequado seguindo WCAG 2.1 AA

## Responsividade

O componente é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- Mobile: Layout em coluna única com campos otimizados para toque
- Tablet: Layout balanceado com espaçamento adequado
- Desktop: Layout otimizado com máximo de 512px de largura

## Animações

O componente utiliza várias animações personalizadas:

- `card-hover-glow`: Efeito de brilho ao passar o mouse
- `transition-smooth`: Transições suaves de 300ms
- `btn-bounce`: Efeito de compressão ao clicar nos botões
- `progress-animate`: Animação de crescimento da barra de progresso
- `fade-in-up`: Animação de entrada para elementos

## Dependências

- React Hook Form para gerenciamento de formulário
- Zod para validação de dados
- date-fns para formatação de datas
- Lucide React para ícones
- Componentes UI do projeto (shadcn/ui)

## Exemplo Completo

Veja o arquivo `src/components/GoalFormExample.tsx` para um exemplo completo de implementação com integração de API, feedback de toast e alternância entre modos de criação e edição.

## Demonstração

Para visualizar o componente em ação, visite a página de demonstração em `/goal-form-demo`.