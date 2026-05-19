import { connectorsForWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  phantomWallet,
  rabbyWallet,
  injectedWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const hasValidProjectId = projectId && projectId !== 'your_project_id_here';

if (!hasValidProjectId) {
  console.warn(
    '[SafeTea] No valid VITE_WALLETCONNECT_PROJECT_ID found. ' +
    'WalletConnect QR and some wallets will be unavailable. ' +
    'Get a free ID at https://cloud.walletconnect.com/'
  );
}

// Public Sepolia RPC endpoints
const sepoliaTransport = fallback([
  http('https://sepolia.gateway.tenderly.co'),
  http('https://rpc2.sepolia.org'),
  http('https://ethereum-sepolia-rpc.publicnode.com'),
]);

const walletGroups = () => [
  {
    groupName: 'Popular',
    wallets: [
      metaMaskWallet,
      coinbaseWallet,
      rainbowWallet,
      walletConnectWallet,
      trustWallet,
      phantomWallet,
      rabbyWallet,
    ],
  },
  {
    groupName: 'Other',
    wallets: [injectedWallet, safeWallet],
  },
];

// When a valid project ID is present, use getDefaultConfig which handles
// WalletConnect + all default wallets automatically.
// When not, manually wire up connectors so browser-injected wallets still work.
export const config = hasValidProjectId
  ? getDefaultConfig({
      appName: 'SafeTea',
      projectId,
      chains: [sepolia],
      transports: { [sepolia.id]: sepoliaTransport },
      ssr: false,
    })
  : (() => {
      const connectors = connectorsForWallets(
        walletGroups(),
        {
          appName: 'SafeTea',
          projectId: 'PLACEHOLDER',
        }
      );

      return createConfig({
        chains: [sepolia],
        connectors,
        transports: { [sepolia.id]: sepoliaTransport },
      });
    })();
