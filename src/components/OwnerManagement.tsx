import React from 'react';
import { ArrowLeft, Crown, Shield, Copy, MoreVertical, UserPlus, Settings } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { SafeWallet } from '../App';

interface OwnerManagementProps {
  wallet: SafeWallet;
  onBack: () => void;
  onAddOwner: () => void;
  onChangeThreshold: () => void;
}

export function OwnerManagement({ wallet, onBack, onAddOwner, onChangeThreshold }: OwnerManagementProps) {
  const owners = [
    {
      address: wallet.owners[0] || '0x8ba1f109551bD432803012645Hac136c82067433',
      isCreator: true,
      name: 'Alice (You)',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      joinedDate: wallet.createdDate,
      transactionsSigned: 45,
    },
    ...wallet.owners.slice(1).map((address, index) => ({
      address,
      isCreator: false,
      name: `Owner ${index + 2}`,
      avatar: `https://images.pexels.com/photos/${1043471 + index}/pexels-photo-${1043471 + index}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      joinedDate: wallet.createdDate,
      transactionsSigned: Math.floor(Math.random() * 30) + 10,
    }))
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-light text-white mb-2">Owner Management</h1>
        <p className="text-gray-400">Manage the owners and settings of {wallet.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Safe Stats */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Safe Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Safe Name</p>
                <p className="text-white text-lg">{wallet.name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Owners</p>
                <p className="text-white text-xl">{wallet.owners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Threshold</p>
                <p className="text-white text-xl">{wallet.threshold} of {wallet.owners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                <p className="text-white text-xl">{wallet.totalTransactions}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Created</p>
                <p className="text-white">{new Date(wallet.createdDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onAddOwner}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onChangeThreshold}
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Threshold
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Owners List */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-white">Safe Owners</h2>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Manage Permissions
              </Button>
            </div>

            <div className="space-y-4">
              {owners.map((owner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={owner.avatar}
                        alt={owner.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {owner.isCreator && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-black" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium">{owner.name}</h3>
                        {owner.isCreator && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-mono text-sm">
                          {owner.address.slice(0, 6)}...{owner.address.slice(-4)}
                        </span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(owner.address)}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <Copy className="h-3 w-3 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span>Joined {new Date(owner.joinedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{owner.transactionsSigned} transactions signed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm">Active</span>
                    
                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors ml-4">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Owner Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Add New Owner</h3>
                  <p className="text-gray-400 text-sm">Invite a new owner to join this Safe</p>
                </div>
                <Button variant="outline" onClick={onAddOwner}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Owner
                </Button>
              </div>
            </div>

            {/* Threshold Section */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Confirmation Threshold</h3>
                  <p className="text-gray-400 text-sm">
                    Currently requires {wallet.threshold} out of {wallet.owners.length} confirmations
                  </p>
                </div>
                <Button variant="outline" onClick={onChangeThreshold}>
                  <Settings className="h-4 w-4 mr-2" />
                  Change Threshold
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}