import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http, fallback } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const hasValidProjectId = projectId && projectId !== 'your_project_id_here';

if (!hasValidProjectId) {
  console.warn(
    '[SafeTea] No valid VITE_WALLETCONNECT_PROJECT_ID found. ' +
    'Running with injected wallet only. Get a free ID at https://cloud.walletconnect.com/'
  );
}

// Public Sepolia RPC endpoints — all verified to send CORS headers for browser use
const sepoliaTransport = fallback([
  http('https://sepolia.gateway.tenderly.co'),
  http('https://rpc2.sepolia.org'),
  http('https://ethereum-sepolia-rpc.publicnode.com'),
]);

export const config = hasValidProjectId
  ? getDefaultConfig({
      appName: 'SafeTea',
      projectId,
      chains: [sepolia],
      transports: { [sepolia.id]: sepoliaTransport },
      ssr: false,
    })
  : createConfig({
      chains: [sepolia],
      connectors: [injected()],
      transports: { [sepolia.id]: sepoliaTransport },
    });