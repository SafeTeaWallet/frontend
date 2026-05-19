import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';

import { config } from './configs/wagmi-config.ts';

const queryClient = new QueryClient();

// Matches the app's #0a0a0f / #0d0d12 dark palette with muted purple accents.
// Overrides midnight theme's bright blue focus, pink wave graphics, and light greys.
const safeteaTheme = {
  // Core accent — muted purple, not the bright #9333ea
  '--ck-accent-color': '#7c3aed',
  '--ck-accent-text-color': '#ffffff',
  '--ck-focus-color': '#7c3aed',
  '--ck-spinner-color': '#7c3aed',

  // Modal chrome
  '--ck-overlay-background': 'rgba(0, 0, 0, 0.75)',
  '--ck-modal-box-shadow': 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.9)',
  '--ck-border-radius': '14px',

  // Backgrounds — darker than midnight's #1F2023
  '--ck-body-background': '#0d0d12',
  '--ck-body-background-transparent': 'rgba(13,13,18,0)',
  '--ck-body-background-secondary': '#111118',
  '--ck-body-background-tertiary': '#0a0a0f',
  '--ck-body-background-secondary-hover-background': 'rgba(124,58,237,0.07)',
  '--ck-body-background-secondary-hover-outline': 'rgba(124,58,237,0.2)',
  '--ck-tertiary-box-shadow': 'inset 0 0 0 1px rgba(255,255,255,0.04)',

  // Text — slightly dimmer than pure white
  '--ck-body-color': '#e8e8f0',
  '--ck-body-color-muted': '#5a5a72',
  '--ck-body-color-muted-hover': '#a0a0b8',
  '--ck-body-action-color': '#5a5a72',

  // Dividers
  '--ck-body-divider': 'rgba(255,255,255,0.06)',

  // Primary button — muted purple
  '--ck-primary-button-background': 'rgba(124,58,237,0.15)',
  '--ck-primary-button-hover-background': 'rgba(124,58,237,0.25)',
  '--ck-primary-button-color': '#e8e8f0',
  '--ck-primary-button-box-shadow': 'inset 0 0 0 1px rgba(124,58,237,0.3)',
  '--ck-primary-button-border-radius': '10px',

  // Secondary button
  '--ck-secondary-button-background': '#111118',
  '--ck-secondary-button-hover-background': '#18181f',
  '--ck-secondary-button-color': '#e8e8f0',
  '--ck-secondary-button-box-shadow': 'inset 0 0 0 1px rgba(255,255,255,0.06)',
  '--ck-secondary-button-border-radius': '10px',

  // Connect button (the inline button, not modal)
  '--ck-connectbutton-background': '#111118',
  '--ck-connectbutton-hover-background': '#18181f',
  '--ck-connectbutton-color': '#e8e8f0',
  '--ck-connectbutton-box-shadow': 'inset 0 0 0 1px rgba(255,255,255,0.06)',

  // Tooltips
  '--ck-tooltip-background': '#111118',
  '--ck-tooltip-background-secondary': '#0d0d12',
  '--ck-tooltip-color': '#e8e8f0',
  '--ck-tooltip-shadow': '0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.6)',

  // QR code
  '--ck-qr-dot-color': '#7c3aed',
  '--ck-qr-background': '#0d0d12',
  '--ck-qr-border-color': 'rgba(255,255,255,0.06)',

  // Disclaimer
  '--ck-body-disclaimer-background': '#0a0a0f',
  '--ck-body-disclaimer-color': '#5a5a72',
  '--ck-body-disclaimer-link-color': '#7c3aed',
  '--ck-body-disclaimer-link-hover-color': '#a78bfa',

  // Kill the pink/colourful wave graphic — replace with muted purple tones
  '--ck-graphic-wave-stop-01': '#1e1030',
  '--ck-graphic-wave-stop-02': '#2d1b4e',
  '--ck-graphic-wave-stop-03': '#3b1f6b',
  '--ck-graphic-wave-stop-04': '#2a1545',
  '--ck-graphic-wave-stop-05': '#1a0d2e',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            theme="midnight"
            mode="dark"
            customTheme={safeteaTheme}
            options={{
              hideNoWalletCTA: true,
              walletConnectCTA: 'both',
              overlayBlur: 4,
            }}
          >
            <App />
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
