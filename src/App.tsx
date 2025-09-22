import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAccount, useConnect } from "wagmi";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { CreateSafe } from "./components/CreateSafe";
import { TransactionPage } from "./components/TransactionPage";
import { AllTransactionsPage } from "./components/AllTransactionsPage";
import { OwnerManagement } from "./components/OwnerManagement";
import { WalletSelection } from "./components/WalletSelection";
import { SubmitTransactionPage } from "./components/SubmitTransactionPage";
import { AddOwnerPage } from "./components/AddOwnerPage";
import { ImportTokenPage } from "./components/ImportTokenPage";
import { ConfirmTransactionPage } from "./components/ConfirmTransactionPage";
import { useSafeWallets } from "./hooks/useSafeWallets";
import { useContracts } from "./hooks/useContracts";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  logoURI?: string;
}

export interface TransactionData {
  type: "legacy" | "token";
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
  const { isConnected, address } = useAccount();
  const { createWallet } = useContracts();
  const { 
    wallets, 
    selectedWallet, 
    handleWalletSelect, 
    refreshWalletData,
    isLoading 
  } = useSafeWallets();
  
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionData | null>(null);

  const [tokens, setTokens] = useState<Token[]>([
    {
      address: "0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      balance: "0.00", // This will be updated by TokenBalanceCard
      logoURI: "https://upload.wikimedia.org/wikipedia/commons/4/49/USDC_Logo.png",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      balance: "0.00", // This will be updated by TokenBalanceCard
      logoURI: "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png",
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      balance: "0.00", // This will be updated by TokenBalanceCard
      logoURI: "https://images.seeklogo.com/logo-png/39/1/dai-dai-logo-png_seeklogo-398219.png",
    },
  ]);

  const handleSafeCreated = async (owners: string[], _safeName: string) => {
    try {
      await createWallet(owners);
      // Refresh wallet data after creation
      setTimeout(() => {
        refreshWalletData();
      }, 2000); // Wait for blockchain confirmation
    } catch (error) {
      console.error('Error creating safe:', error);
      throw error;
    }
  };

  const handleSubmitTransaction = (transactionData: TransactionData) => {
    setPendingTransaction(transactionData);
  };

  const handleConfirmTransaction = () => {
    setPendingTransaction(null);
    refreshWalletData(); // Refresh data after transaction
  };

  const handleAddToken = (token: Token) => {
    setTokens((prev) => [...prev, token]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Show header when connected and not on landing page */}
      {isConnected && address && window.location.pathname !== '/' && (
        <Header
          currentPage=""
          selectedWallet={selectedWallet}
          onNavigate={() => {}}
          onSwitchWallet={() => {}}
        />
      )}

      <main className="relative z-10">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Wallet Selection */}
          <Route
            path="/wallets"
            element={
              <WalletSelection
                wallets={wallets}
                onSelectWallet={handleWalletSelect}
                isLoading={isLoading}
              />
            }
          />

          {/* Create Safe */}
          <Route
            path="/create-safe"
            element={<CreateSafe onSafeCreated={handleSafeCreated} />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              selectedWallet ? (
                <Dashboard wallet={selectedWallet} tokens={tokens} />
              ) : (
                <Navigate to="/wallets" replace />
              )
            }
          />

          {/* Submit Transaction */}
          <Route
            path="/submit-transaction"
            element={
              selectedWallet ? (
                <SubmitTransactionPage
                  wallet={selectedWallet}
                  tokens={tokens}
                  onSubmit={handleSubmitTransaction}
                  onAddToken={handleAddToken}
                />
              ) : (
                <Navigate to="/wallets" replace />
              )
            }
          />

          {/* Confirm Transaction */}
          <Route
            path="/confirm-transaction"
            element={
              pendingTransaction ? (
                <ConfirmTransactionPage
                  transaction={pendingTransaction}
                  onConfirm={handleConfirmTransaction}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Transaction Details */}
          <Route path="/transaction/:txId" element={<TransactionPage />} />

          {/* All Transactions */}
          <Route path="/transactions" element={<AllTransactionsPage />} />

          {/* Owner Management */}
          <Route
            path="/owners"
            element={
              selectedWallet ? (
                <OwnerManagement wallet={selectedWallet} />
              ) : (
                <Navigate to="/wallets" replace />
              )
            }
          />

          {/* Add Owner */}
          <Route
            path="/add-owner"
            element={
              selectedWallet ? (
                <AddOwnerPage wallet={selectedWallet} />
              ) : (
                <Navigate to="/wallets" replace />
              )
            }
          />

          {/* Import Token */}
          <Route
            path="/import-token"
            element={<ImportTokenPage onImport={handleAddToken} />}
          />

          {/* Catch all - redirect to appropriate page */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isConnected
                    ? selectedWallet
                      ? "/dashboard"
                      : "/wallets"
                    : "/"
                }
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
