import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

export function useWalletGuard() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  const requireWallet = (callback?: () => void) => {
    if (!isConnected) {
      // Redirect to landing page for wallet connection
      navigate('/');
      return false;
    }
    if (callback) callback();
    return true;
  };

  return {
    isConnected,
    requireWallet
  };
}