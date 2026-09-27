import { useState } from 'react';
import type { Money } from '@/core/money';
import { MOCK_DEAL_SUMMARY } from '../mockData';

export const useAmountInputDemo = () => {
  const [budget, setBudget] = useState<Money | null>(MOCK_DEAL_SUMMARY.budget);
  const [withdraw, setWithdraw] = useState<Money | null>(null);

  return { budget, setBudget, withdraw, setWithdraw };
};
