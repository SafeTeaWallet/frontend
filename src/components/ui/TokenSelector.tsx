import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Input } from './Input';
import { Token } from '../../App';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token | null) => void;
  onAddToken?: (token: Token) => void;
  placeholder?: string;
}

export function TokenSelector({ 
  tokens, 
  selectedToken, 
  onSelectToken, 
  onAddToken,
  placeholder = "Select a token" 
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [customTokenData, setCustomTokenData] = useState<Token | null>(null);
  const [customError, setCustomError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomTokenSearch = async () => {
    if (!customAddress || customAddress.length !== 42 || !customAddress.startsWith('0x')) {
      setCustomError('Please enter a valid contract address');
      return;
    }

    setIsLoadingCustom(true);
    setCustomError('');
    setCustomTokenData(null);

    try {
      // Simulate API call to fetch token data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if token already exists
      const existingToken = tokens.find(t => t.address.toLowerCase() === customAddress.toLowerCase());
      if (existingToken) {
        setCustomError('Token already exists in your list');
        setIsLoadingCustom(false);
        return;
      }

      // Mock token data - in real app, fetch from blockchain
      const mockTokenData: Token = {
        address: customAddress,
        symbol: 'CUSTOM',
        name: 'Custom Token',
        decimals: 18,
        balance: '0',
        logoURI: undefined
      };

      setCustomTokenData(mockTokenData);
    } catch (err) {
      setCustomError('Failed to fetch token data. Please check the contract address.');
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleAddCustomToken = () => {
    if (customTokenData && onAddToken) {
      onAddToken(customTokenData);
      onSelectToken(customTokenData);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomAddress('');
      setCustomTokenData(null);
    }
  };

  const resetCustomToken = () => {
    setCustomAddress('');
    setCustomTokenData(null);
    setCustomError('');
    setShowCustomInput(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      resetCustomToken();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {selectedToken.logoURI ? (
                  <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6" />
                ) : (
                  <span className="text-white font-bold text-xs">{selectedToken.symbol.slice(0, 2)}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{selectedToken.symbol}</p>
                <p className="text-gray-400 text-sm">{selectedToken.balance}</p>
              </div>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <GlassCard className="p-4 max-h-80 overflow-hidden">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Custom Token Toggle */}
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="w-full justify-start text-purple-400 hover:text-purple-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Token
              </Button>
            </div>

            {/* Custom Token Input */}
            {showCustomInput && (
              <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-sm">Add Custom Token</h4>
                  <button
                    onClick={resetCustomToken}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="0x... Token contract address"
                      value={customAddress}
                      onChange={(e) => {
                        setCustomAddress(e.target.value);
                        setCustomError('');
                        setCustomTokenData(null);
                      }}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleCustomTokenSearch}
                      disabled={isLoadingCustom || !customAddress}
                      size="sm"
                      variant="outline"
                    >
                      {isLoadingCustom ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {customError && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{customError}</span>
                    </div>
                  )}

                  {customTokenData && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">Token Found</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium text-sm">{customTokenData.name}</p>
                          <p className="text-gray-400 text-xs">{customTokenData.symbol}</p>
                        </div>
                        <Button
                          onClick={handleAddCustomToken}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Add Token
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Token List */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      onSelectToken(token);
                      setIsOpen(false);
                    }}
                    className="w-full p-3 rounded-lg hover:bg-white/5 transition-colors flex items-center space-x-3 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-6 h-6" />
                      ) : (
                        <span className="text-white font-bold text-xs">{token.symbol.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{token.symbol}</p>
                        <p className="text-white text-sm">{token.balance}</p>
                      </div>
                      <p className="text-gray-400 text-sm">{token.name}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6">
                  <Search className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No tokens found</p>
                  <p className="text-gray-500 text-xs">Try searching or adding a custom token</p>
                </div>
              )}
            </div>

            {/* Clear Selection */}
            {selectedToken && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelectToken(null);
                    setIsOpen(false);
                  }}
                  className="w-full text-gray-400 hover:text-white"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}