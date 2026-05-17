import { useState } from 'react';

export interface TransactionModalState {
  isOpen: boolean;
  title: string;
  description: string;
  estimatedGas?: string;
  networkFee?: string;
  details?: Array<{ label: string; value: string }>;
  warningMessage?: string;
  onConfirm?: () => Promise<`0x${string}` | void>;
}

export function useTransactionModal() {
  const [modalState, setModalState] = useState<TransactionModalState>({
    isOpen: false,
    title: '',
    description: '',
  });

  const openModal = (config: Omit<TransactionModalState, 'isOpen'>) => {
    setModalState({ ...config, isOpen: true });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return { modalState, openModal, closeModal };
}
