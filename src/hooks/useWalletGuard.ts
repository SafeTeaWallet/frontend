import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

export function useWalletGuard() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const requireWallet = (callback?: () => void) => {
    if (!isConnected) {
      // Redirect to landing page instead of showing modal
      navigate('/');
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