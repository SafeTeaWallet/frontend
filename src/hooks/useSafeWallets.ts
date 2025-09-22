import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContracts, SafeWalletData, TransactionData } from './useContracts';
import { SafeWallet } from '../App';

export function useSafeWallets() {
  const { userWallets, getWalletDetails, getWalletTransactions, userAddress } = useContracts();
  const [selectedWallet, setSelectedWallet] = useState<SafeWallet | null>(null);

  // Fetch wallet details for all user wallets
  const { data: walletDetails, isLoading, refetch } = useQuery({
    queryKey: ['walletDetails', userWallets, userAddress],
    queryFn: async () => {
      if (!userWallets || userWallets.length === 0) return [];

      console.log('Fetching wallet details for:', userWallets);

      const details = await Promise.all(
        userWallets.map(async (address) => {
          const walletData = await getWalletDetails(address);
          if (!walletData) return null;

          console.log('Wallet data for', address, ':', walletData);

          const transactions = await getWalletTransactions(address);
          console.log('Transactions for', address, ':', transactions);
          
          const pendingTransactions = transactions.filter(
            tx => !tx.executed && !tx.canceled
          ).length;

          console.log('Pending transactions for', address, ':', pendingTransactions);

          return {
            id: address,
            name: `Safe ${address.slice(0, 6)}...${address.slice(-4)}`,
            address: walletData.address,
            owners: walletData.owners,
            threshold: walletData.threshold,
            ethBalance: walletData.balance,
            totalTransactions: walletData.transactionCount,
            pendingTransactions,
            createdDate: new Date().toISOString().split('T')[0], // Placeholder
            isActive: selectedWallet?.address === address,
          } as SafeWallet;
        })
      );

      return details.filter(Boolean) as SafeWallet[];
    },
    enabled: !!userWallets && !!userAddress,
    staleTime: 30000, // 30 seconds
  });

  // Get transactions for selected wallet
  const { data: selectedWalletTransactions, refetch: refetchTransactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['walletTransactions', selectedWallet?.address],
    queryFn: async () => {
      if (!selectedWallet) return [];
      console.log('Fetching transactions for selected wallet:', selectedWallet.address);
      const transactions = await getWalletTransactions(selectedWallet.address);
      console.log('Selected wallet transactions:', transactions);
      return transactions;
    },
    enabled: !!selectedWallet,
    staleTime: 10000, // 10 seconds
  });

  const handleWalletSelect = (wallet: SafeWallet) => {
    console.log('Setting selected wallet in hook:', wallet);
    setSelectedWallet(wallet);
  };

  const refreshWalletData = () => {
    refetch();
    if (selectedWallet) {
      refetchTransactions();
    }
  };

  // Get pending transactions count for a specific wallet
  const getPendingTransactionsCount = (walletAddress: string): number => {
    console.log('Getting pending count for:', walletAddress, 'transactions:', selectedWalletTransactions);
    
    if (!selectedWalletTransactions || selectedWallet?.address !== walletAddress) {
      return 0;
    }
    return selectedWalletTransactions.filter(tx => !tx.executed && !tx.canceled).length;
  };

  // Get transaction status
  const getTransactionStatus = (tx: TransactionData): 'pending' | 'executed' | 'rejected' => {
    if (tx.executed) return 'executed';
    if (tx.canceled) return 'rejected';
    return 'pending';
  };

  // Format transaction for display
  const formatTransactionForDisplay = (tx: TransactionData) => {
    const status = getTransactionStatus(tx);
    console.log('Formatting transaction:', tx, 'status:', status);

    return {
      id: tx.index.toString(),
      to: tx.to,
      value: `${tx.value} ETH`,
      status,
      confirmations: tx.confirmations,
      required: selectedWallet?.threshold || 0,
      timestamp: new Date(tx.createdAt * 1000).toLocaleString(),
      type: 'legacy' as const,
      hasConfirmed: tx.hasConfirmed,
      hasRejected: tx.hasRejected,
      expiry: tx.expiry,
      data: tx.data,
      nonce: tx.nonce || tx.index,
      submittedBy: tx.submittedBy || tx.to,
      gasLimit: tx.gasLimit || '21000',
      gasPrice: tx.gasPrice || '20 gwei',
    };
  };

  console.log('useSafeWallets state:', {
    wallets: walletDetails?.length || 0,
    selectedWallet: selectedWallet?.address,
    selectedWalletTransactions: selectedWalletTransactions?.length || 0,
    isTransactionsLoading,
    isLoading
  });

  return {
    wallets: walletDetails || [],
    selectedWallet,
    selectedWalletTransactions: selectedWalletTransactions || [],
    isTransactionsLoading,
    isLoading,
    handleWalletSelect,
    refreshWalletData,
    getPendingTransactionsCount,
    getTransactionStatus,
    formatTransactionForDisplay,
  };
}