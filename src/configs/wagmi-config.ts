import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { mainnet, sepolia, anvil } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const hasValidProjectId = projectId && projectId !== 'your_project_id_here';

if (!hasValidProjectId) {
  console.warn(
    '[SafeTea] No valid VITE_WALLETCONNECT_PROJECT_ID found. ' +
    'Running with injected wallet only. Get a free ID at https://cloud.walletconnect.com/'
  );
}

// Use full RainbowKit config when a real WalletConnect project ID is available,
// otherwise fall back to injected-only to avoid hanging on init.
export const config = hasValidProjectId
  ? getDefaultConfig({
      appName: 'SafeTea Wallet',
      projectId,
      chains: [mainnet, sepolia, anvil],
      ssr: false,
    })
  : createConfig({
      chains: [mainnet, sepolia, anvil],
      connectors: [injected()],
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [anvil.id]: http(),
      },
    });