import { getDefaultConfig } from 'connectkit';
import { createConfig, http, fallback } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
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

const ckConfig = getDefaultConfig({
  appName: 'SafeTea',
  appIcon: '/logo.png',
  appDescription: 'Non-custodial multi-sig wallet for teams and DAOs',
  walletConnectProjectId: hasValidProjectId ? projectId : 'PLACEHOLDER',
  chains: [sepolia],
  transports: { [sepolia.id]: sepoliaTransport },
  // Disable Aave/Family managed accounts (centralized option)
  enableAaveAccount: false,
});

// Override connectors: only injected (MetaMask, Rabby, etc.) + WalletConnect
// This removes Coinbase Smart Wallet and other centralized options
export const config = createConfig({
  ...ckConfig,
  connectors: [
    injected(),
    ...(hasValidProjectId
      ? [walletConnect({ projectId, showQrModal: false })]
      : []),
  ],
});
