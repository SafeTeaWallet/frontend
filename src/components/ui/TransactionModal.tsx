import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, ExternalLink, Copy, Loader } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  description: string;
  transactionHash?: string;
  onConfirm: () => Promise<void>;
  estimatedGas?: string;
  networkFee?: string;
  details?: Array<{ label: string; value: string }>;
  warningMessage?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  transactionHash,
  onConfirm,
  estimatedGas = '0.002 ETH',
  networkFee = '~$5.00',
  details = [],
  warningMessage
}: TransactionModalProps) {
  const { chain } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'waiting' | 'success' | 'error'>('confirm');

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
    query: {
      enabled: !!transactionHash,
    },
  });

  useEffect(() => {
    if (transactionHash && !receipt && !isWaitingForReceipt) {
      setStep('waiting');
    } else if (receipt) {
      setStep('success');
    }
  }, [transactionHash, receipt, isWaitingForReceipt]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      setStep('waiting');
      await onConfirm();
      // After successful confirmation, wait for transaction
      setTimeout(() => {
        if (!transactionHash) {
          setStep('success');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'waiting') return; // Don't allow closing during waiting
    setStep('confirm');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getExplorerUrl = (hash: string) => {
    if (chain?.id === 1) return `https://etherscan.io/tx/${hash}`;
    if (chain?.id === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== 'waiting' ? handleClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <GlassCard className="p-6 bg-black/80 backdrop-blur-xl border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-white">{title}</h2>
            {step !== 'waiting' && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Content based on step */}
          {step === 'confirm' && (
            <>
              <div className="mb-6">
                <p className="text-gray-300 mb-4">{description}</p>
                
                {/* Transaction Details */}
                {details.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {details.map((detail, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{detail.label}</span>
                        <span className="text-white text-sm font-medium">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gas Estimation */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Estimated Gas</span>
                    <span className="text-white text-sm">{estimatedGas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Network Fee</span>
                    <span className="text-white text-sm">{networkFee}</span>
                  </div>
                </div>

                {/* Warning */}
                {warningMessage && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-300 text-sm">{warningMessage}</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Transaction'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'waiting' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6" />
              <h3 className="text-white font-medium text-lg mb-2">Processing Transaction</h3>
              <p className="text-gray-400 text-sm mb-4">
                Please wait while your transaction is being processed on the blockchain...
              </p>
              <p className="text-gray-500 text-xs">
                This may take a few moments depending on network congestion
              </p>
              
              {transactionHash && (
                <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Transaction Hash</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(transactionHash)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                      <a
                        href={getExplorerUrl(transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                  <p className="text-white font-mono text-xs break-all">
                    {transactionHash}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <div className="absolute inset-0 h-16 w-16 text-green-400 animate-ping opacity-20 mx-auto">
                  <CheckCircle className="h-16 w-16" />
                </div>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Transaction Successful!</h3>
              <p className="text-gray-400 text-sm mb-6">
                Your transaction has been confirmed and processed successfully.
              </p>
              
              {transactionHash && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Transaction Hash</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(transactionHash)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                      <a
                        href={getExplorerUrl(transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                  <p className="text-white font-mono text-xs break-all">
                    {transactionHash}
                  </p>
                </div>
              )}

              <Button
                onClick={() => { handleClose(); onSuccess?.(); }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <X className="h-16 w-16 text-red-400 mx-auto mb-6" />
              <h3 className="text-white font-medium text-lg mb-2">Transaction Failed</h3>
              <p className="text-gray-400 text-sm mb-6">
                {error || 'Something went wrong with your transaction.'}
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}