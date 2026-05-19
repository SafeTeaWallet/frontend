import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, Theme } from '@rainbow-me/rainbowkit';

import { config } from './configs/wagmi-config.ts';

const queryClient = new QueryClient();

const safeteaTheme: Theme = {
  ...darkTheme({
    borderRadius: 'medium',
    fontStack: 'system',
  }),
  colors: {
    ...darkTheme().colors,
    accentColor: '#9333ea',
    accentColorForeground: '#ffffff',
    connectButtonBackground: '#9333ea',
    connectButtonInnerBackground: 'linear-gradient(135deg,#7e22ce,#9333ea)',
    connectButtonText: '#ffffff',
    connectionIndicator: '#22c55e',
    modalBackground: '#0d0d12',
    modalBorder: 'rgba(255,255,255,0.08)',
    modalText: '#f1f1f5',
    modalTextDim: 'rgba(241,241,245,0.4)',
    modalTextSecondary: 'rgba(241,241,245,0.6)',
    menuItemBackground: 'rgba(147,51,234,0.08)',
    profileAction: 'rgba(255,255,255,0.04)',
    profileActionHover: 'rgba(147,51,234,0.12)',
    profileForeground: '#0d0d12',
    selectedOptionBorder: 'rgba(147,51,234,0.5)',
    generalBorder: 'rgba(255,255,255,0.08)',
    generalBorderDim: 'rgba(255,255,255,0.04)',
    actionButtonBorder: 'rgba(255,255,255,0.06)',
    actionButtonSecondaryBackground: 'rgba(255,255,255,0.04)',
    closeButton: 'rgba(255,255,255,0.5)',
    closeButtonBackground: 'rgba(255,255,255,0.06)',
    modalBackdrop: 'rgba(0,0,0,0.8)',
    downloadBottomCardBackground: '#0f0f14',
    downloadTopCardBackground: '#18181f',
    error: '#ef4444',
    standby: '#f59e0b',
  },
  fonts: {
    body: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  shadows: {
    connectButton: '0 4px 24px rgba(147,51,234,0.3)',
    dialog: '0 24px 64px rgba(0,0,0,0.7)',
    profileDetailsAction: '0 2px 6px rgba(0,0,0,0.24)',
    selectedOption: '0 2px 8px rgba(147,51,234,0.3)',
    selectedWallet: '0 2px 8px rgba(147,51,234,0.3)',
    walletLogo: '0 2px 8px rgba(0,0,0,0.3)',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={safeteaTheme}
            showRecentTransactions={true}
            appInfo={{
              appName: 'SafeTea',
              learnMoreUrl: 'https://github.com/SafeTeaWallet',
            }}
          >
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);