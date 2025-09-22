import { useNavigate } from 'react-router-dom';
import { useBalance } from 'wagmi';
import { Copy, Plus, Users, Eye, Clock, CheckCircle, XCircle, ArrowRight, Coins, RefreshCw } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Token, SafeWallet } from '../App';
import { useSafeWallets } from '../hooks/useSafeWallets';
import { TokenBalanceCard } from './TokenBalanceCard';

interface DashboardProps {
  wallet: SafeWallet | null;
  tokens: Token[];
}

export function Dashboard({ 
  wallet,
  tokens,
}: DashboardProps) {
  const navigate = useNavigate();
  
  // If no wallet is selected, redirect to wallet selection
  if (!wallet) {
    navigate('/wallets');
    return null;
  }

  const { data: balance } = useBalance({
    address: wallet.address as `0x${string}`,
  });
  
  const { 
    selectedWalletTransactions, 
    formatTransactionForDisplay,
    refreshWalletData,
    isTransactionsLoading
  } = useSafeWallets();

  // Wait for transactions to load and format them
  const recentTransactions = React.useMemo(() => {
    if (!selectedWalletTransactions || isTransactionsLoading) {
      return [];
    }
    
    console.log('Formatting transactions:', selectedWalletTransactions);
    return selectedWalletTransactions
      .slice(0, 5) // Show only 5 most recent
      .map(formatTransactionForDisplay);
  }, [selectedWalletTransactions, formatTransactionForDisplay, isTransactionsLoading]);

  console.log('Dashboard render:', {
    wallet: wallet?.address,
    selectedWalletTransactions: selectedWalletTransactions.length,
    recentTransactions: recentTransactions.length,
    isTransactionsLoading
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'executed':
        return 'text-green-400 bg-green-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const calculateTotalValue = () => {
    const ethBalance = balance ? parseFloat(balance.value.toString()) / 1e18 : parseFloat(wallet.ethBalance);
    const ethValue = ethBalance * 2500; // Assuming ETH price
    const tokenValue = tokens.reduce((total, token) => {
      const balance = parseFloat(token.balance.replace(/,/g, ''));
      // Simplified token pricing - in real app, fetch from price API
      const price = token.symbol === 'USDC' || token.symbol === 'USDT' ? 1 : 
                   token.symbol === 'DAI' ? 1 : 100;
      return total + (balance * price);
    }, 0);
    return (ethValue + tokenValue).toLocaleString();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light text-white mb-2">{wallet.name}</h1>
              <p className="text-gray-400">Multi-signature wallet dashboard</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={refreshWalletData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => navigate('/wallets')}>
                Switch Wallet
              </Button>
            </div>
          </div>
          
          <GlassCard className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Wallet Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-light text-white">Wallet Details</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/owners')}>
                    <Users className="h-4 w-4 mr-2" />
                    {wallet.owners.length} Owners
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm font-mono text-gray-300 flex-1">
                    {wallet.address}
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(wallet.address)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">ETH Balance</p>
                    <p className="text-2xl font-light text-white">
                      {balance ? (parseFloat(balance.value.toString()) / 1e18).toFixed(4) : wallet.ethBalance}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Value</p>
                    <p className="text-2xl font-light text-white">${calculateTotalValue()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/submit-transaction')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Transaction
                </Button>
                
                <Button variant="outline" onClick={() => navigate('/owners')} className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Owners
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Token Balances */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-white">Token Balances</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/import-token')}>
                <Coins className="h-4 w-4 mr-2" />
                Import Token
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ETH Balance */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ETH</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Ethereum</p>
                    <p className="text-gray-400 text-sm">ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {balance ? (parseFloat(balance.value.toString()) / 1e18).toFixed(4) : wallet.ethBalance}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ${((balance ? (parseFloat(balance.value.toString()) / 1e18) : parseFloat(wallet.ethBalance)) * 2500).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Token Balances */}
              {tokens.map((token, index) => (
                <TokenBalanceCard 
                  key={index} 
                  token={token} 
                  walletAddress={wallet.address} 
                />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-4">
            <div className="text-center">
              <p className="text-2xl font-light text-white mb-1">{wallet.totalTransactions}</p>
              <p className="text-gray-400 text-sm">Total Transactions</p>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="text-center">
              <p className="text-2xl font-light text-yellow-400 mb-1">{wallet.pendingTransactions}</p>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
            </div>
          </GlassCard>
          
          <GlassCard className="p-4">
            <div className="text-center">
              <p className="text-2xl font-light text-green-400 mb-1">{wallet.threshold}/{wallet.owners.length}</p>
              <p className="text-gray-400 text-sm">Confirmation Threshold</p>
            </div>
          </GlassCard>
        </div>

        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-white">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-4">
            {isTransactionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading transactions...</p>
              </div>
            ) : recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-white font-medium">Send {tx.value}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.type === 'legacy' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {tx.type === 'legacy' ? 'ETH' : 'Token'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm font-mono">
                        To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status === 'pending' ? `${tx.confirmations}/${tx.required}` : tx.status}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{tx.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Submit your first transaction to get started
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </>
  );
}