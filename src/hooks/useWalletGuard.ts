import { useState } from 'react';
import { useAccount } from 'wagmi';

export function useWalletGuard() {
  const { isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const requireWallet = (callback?: () => void) => {
    if (!isConnected) {
      setShowModal(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const closeModal = () => setShowModal(false);

  return {
    isConnected,
    showModal,
    requireWallet,
    closeModal
  };
}