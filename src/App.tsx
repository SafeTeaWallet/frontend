import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
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

  const handleConnect = () => {
    setIsConnected(true);
    navigate('/wallet-selection');
  };

  const handleWalletSelect = (wallet: SafeWallet) => {
    setSelectedWallet(wallet);
    setWallets(prev => prev.map(w => ({ ...w, isActive: w.id === wallet.id })));
    navigate('/dashboard');
  };

  const handleCreateNewSafe = () => navigate('/create-safe');

  const handleSafeCreated = (newSafe: Omit<SafeWallet, 'id'>) => {
    const safe: SafeWallet = { ...newSafe, id: Date.now().toString() };
    setWallets(prev => [...prev, safe]);
    setSelectedWallet(safe);
    navigate('/dashboard');
  };

  const handleSubmitTransaction = (transactionData: TransactionData) => {
    setPendingTransaction(transactionData);
    navigate('/confirm-transaction');
  };

  const handleConfirmTransaction = () => {
    setPendingTransaction(null);
    navigate('/dashboard');
  };

  const handleAddToken = (token: Token) => {
    setTokens(prev => [...prev, token]);
    navigate('/dashboard');
  };

  const handleAddOwner = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {isConnected && selectedWallet && (
        <Header
          currentPage=""
          selectedWallet={selectedWallet}
          onNavigate={() => {}} // optional to remove or implement
          onSwitchWallet={() => navigate('/wallet-selection')}
        />
      )}

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage onConnect={handleConnect} />} />
          <Route path="/wallet-selection" element={
            <WalletSelection
              wallets={wallets}
              onSelectWallet={handleWalletSelect}
              onCreateNew={handleCreateNewSafe}
            />
          } />
          <Route path="/dashboard" element={
            isConnected && selectedWallet ? (
              <Dashboard
                wallet={selectedWallet}
                tokens={tokens}
                onSubmitTransaction={() => navigate('/submit-transaction')}
                onViewOwners={() => navigate('/owners')}
                onViewTransaction={(id) => {
                  setSelectedTransaction(id);
                  navigate(`/transaction/${id}`);
                }}
                onViewAllTransactions={() => navigate('/all-transactions')}
                onImportToken={() => navigate('/import-token')}
                onSwitchWallet={() => navigate('/wallet-selection')}
              />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/create-safe" element={
            <CreateSafe
              onBack={() => navigate('/wallet-selection')}
              onSafeCreated={handleSafeCreated}
            />
          } />
          <Route path="/transaction/:txId" element={
            <TransactionPage
              transactionId={selectedTransaction}
              onBack={() => navigate('/dashboard')}
            />
          } />
          <Route path="/all-transactions" element={
            <AllTransactionsPage
              onBack={() => navigate('/dashboard')}
              onViewTransaction={(id) => {
                setSelectedTransaction(id);
                navigate(`/transaction/${id}`);
              }}
            />
          } />
          <Route path="/owners" element={
            selectedWallet ? (
              <OwnerManagement
                wallet={selectedWallet}
                onBack={() => navigate('/dashboard')}
                onAddOwner={() => navigate('/add-owner')}
              />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/submit-transaction" element={
            <SubmitTransactionPage
              tokens={tokens}
              onBack={() => navigate('/dashboard')}
              onSubmit={handleSubmitTransaction}
            />
          } />
          <Route path="/add-owner" element={
            selectedWallet ? (
              <AddOwnerPage
                wallet={selectedWallet}
                onBack={() => navigate('/owners')}
                onSubmit={handleAddOwner}
              />
            ) : (
              <Navigate to="/" />
            )
          } />
          <Route path="/import-token" element={
            <ImportTokenPage
              onBack={() => navigate('/dashboard')}
              onImport={handleAddToken}
            />
          } />
          <Route path="/confirm-transaction" element={
            pendingTransaction ? (
              <ConfirmTransactionPage
                transaction={pendingTransaction}
                onBack={() => navigate('/submit-transaction')}
                onConfirm={handleConfirmTransaction}
              />
            ) : (
              <Navigate to="/dashboard" />
            )
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
