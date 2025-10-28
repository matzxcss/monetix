import React from 'react';
import TransactionFormExample from '@/components/TransactionFormExample';

const TransactionFormDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <TransactionFormExample />
      </div>
    </div>
  );
};

export default TransactionFormDemo;