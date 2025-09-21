import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { TransactionModal } from './ui/TransactionModal';
import { useTransactionModal } from '../hooks/useTransactionModal';
import { useContracts } from '../hooks/useContracts';
import { useSafeWallets } from '../hooks/useSafeWallets';

export function TransactionPage() {
  const navigate = useNavigate();
  const { txId } = useParams<{ txId: string }>();
  const { confirmTransaction, rejectTransaction, getWalletContract } = useContracts();
  const { selectedWallet, selectedWalletTransactions, refreshWalletData } = useSafeWallets();
  const { modalState, openModal, closeModal, updateTransactionHash } = useTransactionModal();
  
  const [ownerConfirmations, setOwnerConfirmations] = useState<Array<{address: string, confirmed: boolean, isSubmitter: boolean}>>([]);

  const txIndex = parseInt(txId || '0');
  const rawTransaction = selectedWalletTransactions.find(tx => tx.index === txIndex);
  
  // Create a properly formatted transaction object with all required fields
  const transaction = rawTransaction ? {
    ...rawTransaction,
    nonce: rawTransaction.nonce || rawTransaction.index,
    submittedBy: rawTransaction.submittedBy || rawTransaction.to,
    gasLimit: rawTransaction.gasLimit || '21000',
    gasPrice: rawTransaction.gasPrice || '20 gwei',
    required: selectedWallet?.threshold || 0,
  } : null;

  // Fetch owner confirmations
  useEffect(() => {
    const fetchOwnerConfirmations = async () => {
      if (!selectedWallet || !transaction) return;
      
      const walletContract = getWalletContract(selectedWallet.address);
      if (!walletContract) return;

      try {
        const confirmations = await Promise.all(
          selectedWallet.owners.map(async (owner) => {
            const hasConfirmed = await walletContract.read.hasConfirmedTransaction([BigInt(transaction.index), owner]);
            return {
              address: owner,
              confirmed: hasConfirmed as boolean,
              isSubmitter: owner === transaction.submittedBy,
            };
          })
        );
        setOwnerConfirmations(confirmations);
      } catch (error) {
        console.error('Error fetching owner confirmations:', error);
      }
    };

    fetchOwnerConfirmations();
  }, [selectedWallet, transaction, getWalletContract]);

  useEffect(() => {
    if (!transaction) {
      navigate('/dashboard');
    }
  }, [transaction, navigate]);

  if (!transaction || !selectedWallet) {
    return null;
  }

  const handleConfirm = async () => {
    openModal({
      title: "Confirm Transaction",
      description: `Confirm transaction #${transaction.nonce} to ${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`,
      details: [
        { label: "Transaction", value: `#${transaction.nonce}` },
        { label: "Amount", value: transaction.value },
        { label: "To", value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}` },
        { label: "Current Confirmations", value: `${transaction.confirmations}/${transaction.required}` },
      ],
      estimatedGas: "~0.001 ETH",
      networkFee: "~$2.50",
      onConfirm: async () => {
        await confirmTransaction(selectedWallet.address, transaction.index);
        refreshWalletData();
        navigate('/dashboard');
      },
    });
  };

  const handleReject = async () => {
    openModal({
      title: "Reject Transaction",
      description: `Reject transaction #${transaction.nonce}. This will count as a rejection vote.`,
      details: [
        { label: "Transaction", value: `#${transaction.nonce}` },
        { label: "Amount", value: transaction.value },
        { label: "To", value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}` },
        { label: "Current Rejections", value: `${transaction.rejections}/${transaction.required}` },
      ],
      estimatedGas: "~0.001 ETH",
      networkFee: "~$2.50",
      warningMessage: "If enough owners reject this transaction, it will be permanently canceled.",
      onConfirm: async () => {
        await rejectTransaction(selectedWallet.address, transaction.index);
        refreshWalletData();
        navigate('/dashboard');
      },
    });
  };

  const handleExecute = async () => {
    openModal({
      title: "Execute Transaction",
      description: `Execute transaction #${transaction.nonce} that has received enough confirmations.`,
      details: [
        { label: "Transaction", value: `#${transaction.nonce}` },
        { label: "Amount", value: transaction.value },
        { label: "To", value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}` },
        { label: "Confirmations", value: `${transaction.confirmations}/${transaction.required} ✓` },
      ],
      estimatedGas: "~0.003 ETH",
      networkFee: "~$7.50",
      onConfirm: async () => {
        // Add execute transaction logic here when available
        await new Promise(resolve => setTimeout(resolve, 2000));
        refreshWalletData();
        navigate('/dashboard');
      },
    });
  };

  const status = transaction.executed ? 'executed' : transaction.canceled ? 'rejected' : 'pending';
  const canConfirm = !transaction.executed && !transaction.canceled && !transaction.hasConfirmed;
  const canReject = !transaction.executed && !transaction.canceled && !transaction.hasRejected;
  const canExecute = transaction.confirmations >= transaction.required;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
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
              {ownerConfirmations.map((owner, index) => (
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
                status === 'pending' 
                  ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                  : status === 'executed'
                  ? 'bg-green-400/10 border-green-400/20 text-green-400'
                  : 'bg-red-400/10 border-red-400/20 text-red-400'
              }`}>
                <div className="flex items-center space-x-2">
                  {status === 'pending' && <Clock className="h-4 w-4" />}
                  {status === 'executed' && <CheckCircle className="h-4 w-4" />}
                  {status === 'rejected' && <XCircle className="h-4 w-4" />}
                  <span className="font-medium capitalize">{status}</span>
                </div>
                <p className="text-sm mt-1 opacity-80">
                  {transaction.confirmations}/{transaction.required} confirmations
                </p>
              </div>

              {canConfirm && (
                <Button
                  onClick={handleConfirm}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Transaction
                </Button>
              )}

              {canExecute && (
                <Button
                  onClick={handleExecute}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  Execute Transaction
                </Button>
              )}

              {canReject && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Transaction
                </Button>
              )}
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

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.description}
        transactionHash={modalState.transactionHash}
        onConfirm={modalState.onConfirm || (() => Promise.resolve())}
        estimatedGas={modalState.estimatedGas}
        networkFee={modalState.networkFee}
        details={modalState.details}
        warningMessage={modalState.warningMessage}
      />
    </div>
  );
}