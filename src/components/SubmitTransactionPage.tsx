import React, { useState } from 'react';
import { ArrowLeft, Send, ChevronDown, Coins, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Token, TransactionData } from '../App';

interface SubmitTransactionPageProps {
  tokens: Token[];
  onBack: () => void;
  onSubmit: (transaction: TransactionData) => void;
}

export function SubmitTransactionPage({ tokens, onBack, onSubmit }: SubmitTransactionPageProps) {
  const [transactionType, setTransactionType] = useState<'legacy' | 'token'>('legacy');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customData, setCustomData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactionData: TransactionData = {
      type: transactionType,
      to: recipient,
      value: amount,
      token: transactionType === 'token' ? selectedToken || undefined : undefined,
      data: customData || undefined
    };

    setIsSubmitting(false);
    onSubmit(transactionData);
  };

  const ethBalance = '12.4567';
  const selectedBalance = transactionType === 'legacy' ? ethBalance : selectedToken?.balance || '0';

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
        
        <h1 className="text-3xl font-light text-white mb-2">Submit Transaction</h1>
        <p className="text-gray-400">Create a new transaction for your SafeTea wallet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Transaction Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Transaction Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('legacy')}
                    className={`p-6 rounded-lg border transition-all ${
                      transactionType === 'legacy'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                        : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">ETH</span>
                      </div>
                      <p className="font-medium text-lg mb-1">Legacy Transaction</p>
                      <p className="text-sm opacity-80">Send ETH to any address</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setTransactionType('token')}
                    className={`p-6 rounded-lg border transition-all ${
                      transactionType === 'token'
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <Coins className="w-12 h-12 mx-auto mb-3" />
                      <p className="font-medium text-lg mb-1">Token Transaction</p>
                      <p className="text-sm opacity-80">Send ERC-20 tokens</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <Input
                  placeholder="0x... or ENS name"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Enter the destination address or ENS name
                </p>
              </div>

              {/* Token Selection (only for token transactions) */}
              {transactionType === 'token' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Token
                  </label>
                  <div className="relative">
                    <select
                      value={selectedToken?.address || ''}
                      onChange={(e) => {
                        const token = tokens.find(t => t.address === e.target.value);
                        setSelectedToken(token || null);
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-gray-800">Select a token</option>
                      {tokens.map((token) => (
                        <option key={token.address} value={token.address} className="bg-gray-800">
                          {token.symbol} - {token.balance}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Choose which token to send from your wallet
                  </p>
                </div>
              )}

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(selectedBalance.replace(/,/g, ''))}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Max: {selectedBalance}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    {transactionType === 'legacy' ? 'ETH' : selectedToken?.symbol || 'TOKEN'}
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Enter the amount to send
                </p>
              </div>

              {/* Custom Data (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data (Optional)
                </label>
                <textarea
                  placeholder="0x... (for contract interactions)"
                  value={customData}
                  onChange={(e) => setCustomData(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Leave empty for simple transfers. Add data for contract interactions.
                </p>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Transaction Summary</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Type</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  transactionType === 'legacy' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {transactionType === 'legacy' ? 'Legacy (ETH)' : 'Token Transfer'}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">To</p>
                <p className="text-white font-mono text-sm">
                  {recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Amount</p>
                <p className="text-white text-lg">
                  {amount || '0'} {transactionType === 'legacy' ? 'ETH' : selectedToken?.symbol || 'TOKEN'}
                </p>
              </div>

              {transactionType === 'token' && selectedToken && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Token</p>
                  <p className="text-white">{selectedToken.name}</p>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">
                  ~{transactionType === 'legacy' ? '0.002' : '0.005'} ETH
                </p>
              </div>

              {customData && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Data</p>
                  <p className="text-white font-mono text-xs break-all">
                    {customData.slice(0, 20)}...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                onClick={handleSubmit}
                disabled={!recipient || !amount || (transactionType === 'token' && !selectedToken) || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Validating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-gray-400 text-xs text-center mt-3">
                Review your transaction details before submitting
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}