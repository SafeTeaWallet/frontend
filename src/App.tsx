import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import React from "react";
import { Header } from "./components/Header";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { CreateSafe } from "./components/CreateSafe";
import { TransactionPage } from "./components/TransactionPage";
import { AllTransactionsPage } from "./components/AllTransactionsPage";
import { OwnerManagement } from "./components/OwnerManagement";
import { WalletSelection } from "./components/WalletSelection";
import { SubmitTransactionPage } from "./components/SubmitTransactionPage";
import { ImportTokenPage } from "./components/ImportTokenPage";
import { ConfirmTransactionPage } from "./components/ConfirmTransactionPage";
import { SafeWalletsProvider, useSafeWalletsContext } from "./contexts/SafeWalletsContext";
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

function RequireWallet({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  if (!isConnected) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const { isConnected, address } = useAccount();
  const { createWallet } = useContracts();
  const {
    wallets,
    selectedWallet,
    handleWalletSelect,
    refreshWalletData,
    isLoading,
  } = useSafeWalletsContext();

  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionData | null>(null);

  const [tokens, setTokens] = useState<Token[]>([
    {
      address: "0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      balance: "0.00",
      logoURI:
        "https://upload.wikimedia.org/wikipedia/commons/4/49/USDC_Logo.png",
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      balance: "0.00",
      logoURI:
        "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png",
    },
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      balance: "0.00",
      logoURI:
        "https://images.seeklogo.com/logo-png/39/1/dai-dai-logo-png_seeklogo-398219.png",
    },
  ]);

  const handleSafeCreated = async (owners: string[], _safeName: string) => {
    try {
      await createWallet(owners);
      setTimeout(() => {
        refreshWalletData();
      }, 2000);
    } catch (error) {
      console.error("Error creating safe:", error);
      throw error;
    }
  };

  const handleConfirmTransaction = () => {
    setPendingTransaction(null);
    refreshWalletData();
  };

  const handleAddToken = (token: Token) => {
    setTokens((prev) => {
      if (prev.find((t) => t.address.toLowerCase() === token.address.toLowerCase())) {
        return prev;
      }
      return [...prev, token];
    });
  };

  const showHeader = isConnected && address && location.pathname !== "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {showHeader && (
        <Header
          currentPage=""
          selectedWallet={selectedWallet}
          onNavigate={() => {}}
          onSwitchWallet={() => {}}
        />
      )}

      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/wallets"
            element={
              <RequireWallet>
                <WalletSelection
                  wallets={wallets}
                  onSelectWallet={handleWalletSelect}
                  isLoading={isLoading}
                />
              </RequireWallet>
            }
          />

          <Route
            path="/create-safe"
            element={
              <RequireWallet>
                <CreateSafe onSafeCreated={handleSafeCreated} />
              </RequireWallet>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireWallet>
                {selectedWallet ? (
                  <Dashboard wallet={selectedWallet} tokens={tokens} />
                ) : (
                  <Navigate to="/wallets" replace />
                )}
              </RequireWallet>
            }
          />

          <Route
            path="/submit-transaction"
            element={
              <RequireWallet>
                {selectedWallet ? (
                  <SubmitTransactionPage
                    wallet={selectedWallet}
                    tokens={tokens}
                    onAddToken={handleAddToken}
                  />
                ) : (
                  <Navigate to="/wallets" replace />
                )}
              </RequireWallet>
            }
          />

          <Route
            path="/confirm-transaction"
            element={
              <RequireWallet>
                {pendingTransaction ? (
                  <ConfirmTransactionPage
                    transaction={pendingTransaction}
                    onConfirm={handleConfirmTransaction}
                  />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </RequireWallet>
            }
          />

          <Route
            path="/transaction/:txId"
            element={<RequireWallet><TransactionPage /></RequireWallet>}
          />
          <Route
            path="/transactions"
            element={<RequireWallet><AllTransactionsPage /></RequireWallet>}
          />

          <Route
            path="/owners"
            element={
              <RequireWallet>
                {selectedWallet ? (
                  <OwnerManagement wallet={selectedWallet} />
                ) : (
                  <Navigate to="/wallets" replace />
                )}
              </RequireWallet>
            }
          />

          <Route
            path="/import-token"
            element={<RequireWallet><ImportTokenPage onImport={handleAddToken} /></RequireWallet>}
          />

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

function App() {
  return (
    <SafeWalletsProvider>
      <AppRoutes />
    </SafeWalletsProvider>
  );
}

export default App;
