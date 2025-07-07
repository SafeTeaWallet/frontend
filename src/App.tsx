import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CreateSafe } from './components/CreateSafe';
import { TransactionPage } from './components/TransactionPage';
import { AllTransactionsPage } from './components/AllTransactionsPage';
import { OwnerManagement } from './components/OwnerManagement';
import { WalletSelection } from './components/WalletSelection';
import { SubmitTransactionPage } from './components/SubmitTransactionPage';
import { AddOwnerPage } from './components/AddOwnerPage';
import { ImportTokenPage } from './components/ImportTokenPage';
import { ConfirmTransactionPage } from './components/ConfirmTransactionPage';
import { useAccount } from 'wagmi';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logoURI?: string;
}

export interface TransactionData {
  type: 'legacy' | 'token';
  to: string;
  value: string;
  token?: Token;
  data?: string;
}

export interface SafeWallet {
  id: string;
  name: string;
  address: string;
  owners: string[];
  threshold: number;
  ethBalance: string;
  totalTransactions: number;
  pendingTransactions: number;
  createdDate: string;
  isActive: boolean;
}

function App() {
  const { isConnected } = useAccount();
  const [pendingTransaction, setPendingTransaction] = useState<TransactionData | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<SafeWallet | null>(null);

  const [wallets, setWallets] = useState<SafeWallet[]>([
    {
      id: '1',
      name: 'Team Treasury',
      address: '0x8ba1f109551bD432803012645Hac136c82067433',
      owners: ['0x8ba1f109551bD432803012645Hac136c82067433', '0x742d35Cc6834C532532c5C4b95929742c395c9f1', '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B'],
      threshold: 3,
      ethBalance: '12.4567',
      totalTransactions: 127,
      pendingTransactions: 3,
      createdDate: '2024-01-01',
      isActive: true
    },
    {
      id: '2',
      name: 'Marketing Fund',
      address: '0x742d35Cc6834C532532c5C4b95929742c395c9f1',
      owners: ['0x8ba1f109551bD432803012645Hac136c82067433', '0x742d35Cc6834C532532c5C4b95929742c395c9f1'],
      threshold: 2,
      ethBalance: '8.2341',
      totalTransactions: 45,
      pendingTransactions: 1,
      createdDate: '2024-01-15',
      isActive: false
    },
    {
      id: '3',
      name: 'Development Pool',
      address: '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B',
      owners: ['0x8ba1f109551bD432803012645Hac136c82067433', '0x742d35Cc6834C532532c5C4b95929742c395c9f1', '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B', '0x1234567890123456789012345678901234567890'],
      threshold: 2,
      ethBalance: '25.7890',
      totalTransactions: 89,
      pendingTransactions: 0,
      createdDate: '2023-12-10',
      isActive: false
    }
  ]);

  const [tokens, setTokens] = useState<Token[]>([
    {
      address: '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      balance: '1,234.56',
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      balance: '2,345.67',
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      balance: '3,456.78',
      logoURI: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'
    }
  ]);

  const handleWalletSelect = (wallet: SafeWallet) => {
    setSelectedWallet(wallet);
    setWallets(prev => prev.map(w => ({ ...w, isActive: w.id === wallet.id })));
  };

  const handleSafeCreated = (newSafe: Omit<SafeWallet, 'id'>) => {
    const safe: SafeWallet = { ...newSafe, id: Date.now().toString() };
    setWallets(prev => [...prev, safe]);
    setSelectedWallet(safe);
  };

  const handleSubmitTransaction = (transactionData: TransactionData) => {
    setPendingTransaction(transactionData);
  };

  const handleConfirmTransaction = () => {
    setPendingTransaction(null);
  };

  const handleAddToken = (token: Token) => {
    setTokens(prev => [...prev, token]);
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isConnected) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  // Wallet required route wrapper
  const WalletRequiredRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isConnected) {
      return <Navigate to="/" replace />;
    }
    if (!selectedWallet) {
      return <Navigate to="/wallets" replace />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Show header only when connected and not on landing page */}
      <Routes>
        <Route path="/" element={null} />
        <Route path="*" element={
          isConnected ? (
            <Header
              currentPage=""
              selectedWallet={selectedWallet}
              onNavigate={() => {}}
              onSwitchWallet={() => {}}
            />
          ) : null
        } />
      </Routes>

      <main className="relative z-10">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Wallet Selection */}
          <Route path="/wallets" element={
            <ProtectedRoute>
              <WalletSelection
                wallets={wallets}
                onSelectWallet={handleWalletSelect}
              />
            </ProtectedRoute>
          } />
          
          {/* Create Safe */}
          <Route path="/create-safe" element={
            <ProtectedRoute>
              <CreateSafe onSafeCreated={handleSafeCreated} />
            </ProtectedRoute>
          } />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <WalletRequiredRoute>
              <Dashboard
                wallet={selectedWallet!}
                tokens={tokens}
              />
            </WalletRequiredRoute>
          } />
          
          {/* Submit Transaction */}
          <Route path="/submit-transaction" element={
            <WalletRequiredRoute>
              <SubmitTransactionPage
                tokens={tokens}
                onSubmit={handleSubmitTransaction}
                onAddToken={handleAddToken}
              />
            </WalletRequiredRoute>
          } />
          
          {/* Confirm Transaction */}
          <Route path="/confirm-transaction" element={
            pendingTransaction ? (
              <WalletRequiredRoute>
                <ConfirmTransactionPage
                  transaction={pendingTransaction}
                  onConfirm={handleConfirmTransaction}
                />
              </WalletRequiredRoute>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } />
          
          {/* Transaction Details */}
          <Route path="/transaction/:txId" element={
            <WalletRequiredRoute>
              <TransactionPage />
            </WalletRequiredRoute>
          } />
          
          {/* All Transactions */}
          <Route path="/transactions" element={
            <WalletRequiredRoute>
              <AllTransactionsPage />
            </WalletRequiredRoute>
          } />
          
          {/* Owner Management */}
          <Route path="/owners" element={
            <WalletRequiredRoute>
              <OwnerManagement wallet={selectedWallet!} />
            </WalletRequiredRoute>
          } />
          
          {/* Add Owner */}
          <Route path="/add-owner" element={
            <WalletRequiredRoute>
              <AddOwnerPage wallet={selectedWallet!} />
            </WalletRequiredRoute>
          } />
          
          {/* Import Token */}
          <Route path="/import-token" element={
            <WalletRequiredRoute>
              <ImportTokenPage onImport={handleAddToken} />
            </WalletRequiredRoute>
          } />
          
          {/* Catch all - redirect to appropriate page */}
          <Route path="*" element={
            <Navigate to={isConnected ? (selectedWallet ? "/dashboard" : "/wallets") : "/"} replace />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;