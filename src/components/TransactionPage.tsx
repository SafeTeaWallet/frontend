import React, { useState } from 'react';
import { ArrowLeft, Copy, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

interface TransactionPageProps {
  transactionId: string | null;
  onBack: () => void;
}

export function TransactionPage({ transactionId, onBack }: TransactionPageProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Mock transaction data
  const transaction = {
    id: transactionId || '1',
    to: '0x742d35Cc6834C532532c5C4b95929742c395c9f1',
    value: '2.5 ETH',
    data: '0x',
    status: 'pending',
    confirmations: 2,
    required: 3,
    timestamp: '2024-01-15T10:30:00Z',
    submittedBy: '0x8ba1f109551bD432803012645Hac136c82067433',
    nonce: 127,
    gasLimit: '21000',
    gasPrice: '20 gwei',
    owners: [
      { address: '0x8ba1f109551bD432803012645Hac136c82067433', confirmed: true, isSubmitter: true },
      { address: '0x742d35Cc6834C532532c5C4b95929742c395c9f1', confirmed: true, isSubmitter: false },
      { address: '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B', confirmed: false, isSubmitter: false },
    ]
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConfirming(false);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsExecuting(false);
  };

  const canConfirm = !transaction.owners.find(o => o.address === '0xA0b86a33E6241447b4F8A8e8F3D1f76C8C2e9C1B')?.confirmed;
  const canExecute = transaction.confirmations >= transaction.required;

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
        
        <h1 className="text-3xl font-light text-white mb-2">Transaction Details</h1>
        <p className="text-gray-400">Review and confirm transaction #{transaction.nonce}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-6">Transaction Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">To</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                    </span>
                    <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                      <Copy className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Value</p>
                  <p className="text-white text-lg font-light">{transaction.value}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Gas Limit</p>
                  <p className="text-white">{transaction.gasLimit}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Gas Price</p>
                  <p className="text-white">{transaction.gasPrice}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Data</p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <code className="text-gray-300 font-mono text-sm">
                    {transaction.data === '0x' ? 'No data' : transaction.data}
                  </code>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Submitted By</p>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">
                    {transaction.submittedBy.slice(0, 6)}...{transaction.submittedBy.slice(-4)}
                  </span>
                  <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Owner Confirmations */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-light text-white mb-6">
              Confirmations ({transaction.confirmations}/{transaction.required})
            </h2>
            
            <div className="space-y-3">
              {transaction.owners.map((owner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      owner.confirmed ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">
                          {owner.address.slice(0, 6)}...{owner.address.slice(-4)}
                        </span>
                        {owner.isSubmitter && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            Submitter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {owner.confirmed ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmed
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Actions */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Actions</h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                transaction.status === 'pending' 
                  ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                  : transaction.status === 'executed'
                  ? 'bg-green-400/10 border-green-400/20 text-green-400'
                  : 'bg-red-400/10 border-red-400/20 text-red-400'
              }`}>
                <div className="flex items-center space-x-2">
                  {transaction.status === 'pending' && <Clock className="h-4 w-4" />}
                  {transaction.status === 'executed' && <CheckCircle className="h-4 w-4" />}
                  {transaction.status === 'rejected' && <XCircle className="h-4 w-4" />}
                  <span className="font-medium capitalize">{transaction.status}</span>
                </div>
                <p className="text-sm mt-1 opacity-80">
                  {transaction.confirmations}/{transaction.required} confirmations
                </p>
              </div>

              {canConfirm && (
                <Button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Transaction
                    </>
                  )}
                </Button>
              )}

              {canExecute && (
                <Button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isExecuting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Executing...
                    </>
                  ) : (
                    'Execute Transaction'
                  )}
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Reject Transaction
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Transaction ID: #{transaction.nonce}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Created: {new Date(transaction.timestamp).toLocaleDateString()}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}