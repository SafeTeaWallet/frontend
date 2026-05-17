import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Filter, Search, Eye } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useSafeWallets } from '../hooks/useSafeWallets';

export function AllTransactionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { selectedWalletTransactions, formatTransactionForDisplay, selectedWallet } = useSafeWallets();

  const allTransactions = selectedWalletTransactions.map(formatTransactionForDisplay);

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
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'executed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const filteredTransactions = allTransactions.filter(tx => {
    const matchesSearch = tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: allTransactions.length,
    pending: allTransactions.filter(tx => tx.status === 'pending').length,
    executed: allTransactions.filter(tx => tx.status === 'executed').length,
    rejected: allTransactions.filter(tx => tx.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-display font-light text-white mb-2">All Transactions</h1>
        <p className="text-gray-400">Complete history of all SafeTea wallet transactions</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8">
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Transactions List */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => navigate(`/transaction/${tx.id}`)}
                className="flex items-center justify-between p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {getStatusIcon(tx.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-white font-medium">Send {tx.value}</p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                        {tx.status === 'pending' ? `${tx.confirmations}/${tx.required}` : tx.status}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-400">
                      <span className="font-mono">
                        To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-mono">
                        By: {tx.submittedBy.slice(0, 6)}...{tx.submittedBy.slice(-4)}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Showing {filteredTransactions.length} of {allTransactions.length} transactions
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}