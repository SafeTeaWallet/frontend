import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, AlertTriangle, CheckCircle, Coins } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Token } from '../App';

interface ImportTokenPageProps {
  onBack: () => void;
  onImport: (token: Token) => void;
}

export function ImportTokenPage({ onBack, onImport }: ImportTokenPageProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<Token | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!contractAddress || contractAddress.length !== 42 || !contractAddress.startsWith('0x')) {
      setError('Please enter a valid contract address');
      return;
    }

    setIsLoading(true);
    setError('');
    setTokenData(null);

    try {
      // Simulate API call to fetch token data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock token data - in real app, fetch from blockchain
      const mockTokenData: Token = {
        address: contractAddress,
        symbol: 'MOCK',
        name: 'Mock Token',
        decimals: 18,
        balance: '0',
        logoURI: undefined
      };

      setTokenData(mockTokenData);
    } catch (err) {
      setError('Failed to fetch token data. Please check the contract address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (tokenData) {
      onImport(tokenData);
    }
  };

  const popularTokens = [
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      logoURI: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      symbol: 'LINK',
      name: 'Chainlink',
      logoURI: 'https://cryptologos.cc/logos/chainlink-link-logo.png'
    },
    {
      address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      symbol: 'MATIC',
      name: 'Polygon',
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      logoURI: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-light text-white mb-2">Import Token</h1>
        <p className="text-gray-400">Add custom ERC-20 tokens to your wallet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search by Contract Address */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-4">Search by Contract Address</h2>
            
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
                      setError('');
                      setTokenData(null);
                    }}
                    className="flex-1"
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
                {error && (
                  <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  Enter the contract address of the ERC-20 token you want to import
                </p>
              </div>

              {/* Token Preview */}
              {tokenData && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Token Found</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {tokenData.logoURI ? (
                        <img src={tokenData.logoURI} alt={tokenData.symbol} className="w-10 h-10" />
                      ) : (
                        <span className="text-white font-bold text-sm">{tokenData.symbol.slice(0, 3)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg">{tokenData.name}</p>
                      <p className="text-gray-400">{tokenData.symbol}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Decimals</p>
                        <p className="text-white">{tokenData.decimals}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Balance</p>
                        <p className="text-white">{tokenData.balance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Popular Tokens */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-4">Popular Tokens</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularTokens.map((token, index) => (
                <button
                  key={index}
                  onClick={() => setContractAddress(token.address)}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8" />
                      ) : (
                        <span className="text-white font-bold text-xs">{token.symbol.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-gray-400 text-sm">{token.symbol}</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
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
                  Anyone can create a token with any name. Always verify the contract address 
                  before importing tokens to avoid scams. Only import tokens from trusted sources.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Import Summary</h3>
            
            {tokenData ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {tokenData.logoURI ? (
                      <img src={tokenData.logoURI} alt={tokenData.symbol} className="w-8 h-8" />
                    ) : (
                      <Coins className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{tokenData.name}</p>
                    <p className="text-gray-400 text-sm">{tokenData.symbol}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Contract Address</p>
                    <p className="text-white font-mono text-xs break-all">{tokenData.address}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Decimals</p>
                    <p className="text-white">{tokenData.decimals}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Balance</p>
                    <p className="text-white">{tokenData.balance} {tokenData.symbol}</p>
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
                <p className="text-gray-400">Search for a token to see import details</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-xs text-center">
                The token will be added to your wallet's token list and will appear in your balance overview.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}