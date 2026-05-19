import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Coins,
} from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Token } from "../App";
import { useContracts } from "../hooks/useContracts";
import { useSafeWalletsContext } from "../contexts/SafeWalletsContext";

interface ImportTokenPageProps {
  onImport: (token: Token) => void;
}

export function ImportTokenPage({ onImport }: ImportTokenPageProps) {
  const navigate = useNavigate();
  const { getTokenInfo } = useContracts();
  const { selectedWallet } = useSafeWalletsContext();

  const [contractAddress, setContractAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<Token | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (
      !contractAddress ||
      contractAddress.length !== 42 ||
      !contractAddress.startsWith("0x")
    ) {
      setError("Please enter a valid contract address");
      return;
    }

    setIsLoading(true);
    setError("");
    setTokenData(null);

    try {
      const walletAddr = selectedWallet?.address || "0x0000000000000000000000000000000000000000";
      const info = await getTokenInfo(contractAddress, walletAddr);

      if (!info) {
        setError("Could not fetch token data. Is this a valid ERC-20 contract?");
        return;
      }

      setTokenData({
        address: contractAddress,
        name: info.name,
        symbol: info.symbol,
        decimals: info.decimals,
        balance: info.balance,
        logoURI: undefined,
      });
    } catch {
      setError("Failed to fetch token data. Please check the contract address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (tokenData) {
      onImport(tokenData);
      navigate("/dashboard");
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-display font-light text-white mb-2">
          Import Token
        </h1>
        <p className="text-gray-400">Add custom ERC-20 tokens to your wallet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-display font-light text-white mb-4">
              Search by Contract Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Contract Address
                </label>
                <div className="flex space-x-3">
                  <Input
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => {
                      setContractAddress(e.target.value);
                      setError("");
                      setTokenData(null);
                    }}
                    className="flex-1"
                    error={error || undefined}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !contractAddress}
                    variant="outline"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Token data is fetched directly from the blockchain
                </p>
              </div>

              {/* Token Preview */}
              {tokenData && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">
                      Token Found
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-bold font-display text-sm">
                        {tokenData.symbol.slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg">
                        {tokenData.name}
                      </p>
                      <p className="text-gray-400">{tokenData.symbol}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-500/20 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Decimals</p>
                      <p className="text-white">{tokenData.decimals}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Wallet Balance</p>
                      <p className="text-white">
                        {tokenData.balance} {tokenData.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Warning */}
          <GlassCard className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  Import Warning
                </p>
                <p className="text-yellow-300 text-sm">
                  Anyone can create a token with any name. Always verify the
                  contract address before importing to avoid scams. Only import
                  tokens from trusted sources.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-display font-light text-white mb-4">
              Import Summary
            </h3>

            {tokenData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white font-bold font-display text-xs">
                      {tokenData.symbol.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{tokenData.name}</p>
                    <p className="text-gray-400 text-sm">{tokenData.symbol}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Contract Address
                    </p>
                    <p className="text-white font-mono text-xs break-all">
                      {tokenData.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Decimals</p>
                    <p className="text-white">{tokenData.decimals}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Current Balance
                    </p>
                    <p className="text-white">
                      {tokenData.balance} {tokenData.symbol}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={handleImport}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Import Token
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Coins className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  Search for a token to see details
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-500 text-xs text-center">
                Token will appear in your balance overview after import
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
