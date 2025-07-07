import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Users, Clock, CheckCircle, Copy, ArrowRight, Search, Filter } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { WalletConnectModal } from './ui/WalletConnectModal';
import { useWalletGuard } from '../hooks/useWalletGuard';
import { SafeWallet } from '../App';

interface WalletSelectionProps {
  wallets: SafeWallet[];
  onSelectWallet: (wallet: SafeWallet) => void;
}

export function WalletSelection({ wallets, onSelectWallet }: WalletSelectionProps) {
  const navigate = useNavigate();
  const { showModal, requireWallet, closeModal } = useWalletGuard();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');

  const handleSelectWallet = (wallet: SafeWallet) => {
    requireWallet(() => {
      onSelectWallet(wallet);
      navigate('/dashboard');
    });
  };

  const handleCreateNew = () => {
    requireWallet(() => navigate('/create-safe'));
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && wallet.pendingTransactions > 0) ||
                         (filterType === 'inactive' && wallet.pendingTransactions === 0);
    return matchesSearch && matchesFilter;
  });

  const totalValue = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.ethBalance), 0);
  const totalPending = wallets.reduce((sum, wallet) => sum + wallet.pendingTransactions, 0);

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="h-16 w-16 text-purple-400" />
              <div className="absolute inset-0 h-16 w-16 text-purple-400 animate-pulse opacity-50" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            Your Safe<span className="text-purple-400">Tea</span> Wallets
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Select a wallet to manage or create a new multi-signature wallet
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="text-center">
                <p className="text-3xl font-light text-white mb-2">{wallets.length}</p>
                <p className="text-gray-400">Total Wallets</p>
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-center">
                <p className="text-3xl font-light text-white mb-2">{totalValue.toFixed(2)} ETH</p>
                <p className="text-gray-400">Total Value</p>
              </div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-center">
                <p className="text-3xl font-light text-yellow-400 mb-2">{totalPending}</p>
                <p className="text-gray-400">Pending Transactions</p>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <GlassCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === filter
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'active' && ` (${wallets.filter(w => w.pendingTransactions > 0).length})`}
                    {filter === 'inactive' && ` (${wallets.filter(w => w.pendingTransactions === 0).length})`}
                    {filter === 'all' && ` (${wallets.length})`}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search wallets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map((wallet) => (
            <GlassCard
              key={wallet.id}
              className="p-6 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
              onClick={() => handleSelectWallet(wallet)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg group-hover:text-purple-400 transition-colors">
                      {wallet.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 font-mono text-sm">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(wallet.address);
                        }}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      >
                        <Copy className="h-3 w-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {wallet.isActive && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Wallet Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">ETH Balance</span>
                  <span className="text-white font-medium">{wallet.ethBalance}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Owners</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{wallet.owners.length}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Threshold</span>
                  <span className="text-white">{wallet.threshold}/{wallet.owners.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Transactions</span>
                  <span className="text-white">{wallet.totalTransactions}</span>
                </div>

                {wallet.pendingTransactions > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pending</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{wallet.pendingTransactions}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                className="w-full group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectWallet(wallet);
                }}
              >
                Select Wallet
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Created Date */}
              <p className="text-gray-500 text-xs text-center mt-3">
                Created {new Date(wallet.createdDate).toLocaleDateString()}
              </p>
            </GlassCard>
          ))}

          {/* Create New Wallet Card */}
          <GlassCard
            className="p-6 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group border-dashed border-white/20"
            onClick={handleCreateNew}
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="h-8 w-8 text-purple-400" />
              </div>
              
              <h3 className="text-white font-medium text-lg mb-2 group-hover:text-purple-400 transition-colors">
                Create New Safe
              </h3>
              
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                Set up a new multi-signature wallet with your team
              </p>

              <Button
                onClick={handleCreateNew}
                variant="outline"
                className="group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Empty State */}
        {filteredWallets.length === 0 && wallets.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No wallets found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showModal}
        onClose={closeModal}
        title="Connect Wallet to Continue"
        message="You need to connect your wallet to create or access SafeTea wallets. Please connect your wallet to get started."
      />
    </div>
  );
}