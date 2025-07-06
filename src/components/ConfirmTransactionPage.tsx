import React, { useState } from 'react';
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { TransactionData } from '../App';

interface ConfirmTransactionPageProps {
  transaction: TransactionData;
  onBack: () => void;
  onConfirm: () => void;
}

export function ConfirmTransactionPage({ transaction, onBack, onConfirm }: ConfirmTransactionPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simulate transaction submission
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSubmitting(false);
    onConfirm();
  };

  const getTransactionTypeInfo = () => {
    if (transaction.type === 'legacy') {
      return {
        title: 'Legacy Transaction',
        subtitle: 'Send ETH',
        color: 'from-blue-500 to-purple-600',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
      };
    } else {
      return {
        title: 'Token Transaction',
        subtitle: `Send ${transaction.token?.symbol || 'Token'}`,
        color: 'from-green-500 to-green-600',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10'
      };
    }
  };

  const typeInfo = getTransactionTypeInfo();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submit Transaction
        </Button>
        
        <h1 className="text-3xl font-light text-white mb-2">Confirm Transaction</h1>
        <p className="text-gray-400">Review and confirm your transaction details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Type */}
          <GlassCard className="p-6">
            <div className={`p-4 rounded-lg border ${typeInfo.bgColor} border-opacity-20 mb-6`}>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${typeInfo.color} flex items-center justify-center`}>
                  {transaction.type === 'legacy' ? (
                    <span className="text-white font-bold">ETH</span>
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {transaction.token?.symbol?.slice(0, 3) || 'TOK'}
                    </span>
                  )}
                </div>
                <div>
                  <p className={`font-medium text-lg ${typeInfo.textColor}`}>{typeInfo.title}</p>
                  <p className="text-gray-400">{typeInfo.subtitle}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-light text-white mb-4">Transaction Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">To</p>
                  <p className="text-white font-mono text-sm">
                    {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-white text-lg font-medium">
                    {transaction.value} {transaction.type === 'legacy' ? 'ETH' : transaction.token?.symbol}
                  </p>
                </div>

                {transaction.token && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Token</p>
                      <p className="text-white">{transaction.token.name}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">Token Address</p>
                      <p className="text-white font-mono text-sm">
                        {transaction.token.address.slice(0, 6)}...{transaction.token.address.slice(-4)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {transaction.data && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Data</p>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <code className="text-gray-300 font-mono text-sm break-all">
                      {transaction.data}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Gas Estimation */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-4">Gas Estimation</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Gas Limit</p>
                <p className="text-white">{transaction.type === 'legacy' ? '21,000' : '65,000'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Gas Price</p>
                <p className="text-white">20 gwei</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Max Fee</p>
                <p className="text-white">~{transaction.type === 'legacy' ? '0.002' : '0.005'} ETH</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Network</p>
                <p className="text-white">Ethereum</p>
              </div>
            </div>
          </GlassCard>

          {/* Security Notice */}
          <GlassCard className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">
                  Multi-Signature Security
                </p>
                <p className="text-purple-300 text-sm">
                  This transaction will require 3 confirmations from wallet owners before it can be executed.
                  Once submitted, other owners will be able to review and confirm the transaction.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Confirmation Process */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-4">What happens next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Transaction submitted to the Safe</p>
                  <p className="text-gray-400 text-sm">Your transaction will be added to the pending queue</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Waiting for owner confirmations (0/3)</p>
                  <p className="text-gray-500 text-sm">Other owners will review and confirm the transaction</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Transaction executed automatically</p>
                  <p className="text-gray-500 text-sm">Once enough confirmations are received</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Summary & Actions */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Transaction Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Type</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  transaction.type === 'legacy' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {transaction.type === 'legacy' ? 'Legacy (ETH)' : 'Token Transfer'}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">To</p>
                <p className="text-white font-mono text-sm">
                  {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Amount</p>
                <p className="text-white text-lg font-medium">
                  {transaction.value} {transaction.type === 'legacy' ? 'ETH' : transaction.token?.symbol}
                </p>
              </div>

              {transaction.token && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Token</p>
                  <p className="text-white">{transaction.token.name}</p>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">~{transaction.type === 'legacy' ? '0.002' : '0.005'} ETH</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Required Confirmations</p>
                <p className="text-white">3 of 3 owners</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting Transaction...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Transaction
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full"
              >
                Back to Edit
              </Button>
            </div>

            <p className="text-gray-400 text-xs text-center mt-4">
              By submitting, you agree to the transaction details above
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}