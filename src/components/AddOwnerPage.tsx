import React, { useState } from 'react';
import { ArrowLeft, UserPlus, AlertTriangle, Users } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SafeWallet } from '../App';

interface AddOwnerPageProps {
  wallet: SafeWallet;
  onBack: () => void;
  onSubmit: () => void;
}

export function AddOwnerPage({ wallet, onBack, onSubmit }: AddOwnerPageProps) {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [threshold, setThreshold] = useState(wallet.threshold);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newTotalOwners = wallet.owners.length + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate transaction submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onSubmit();
  };

  const isValidAddress = ownerAddress.length === 42 && ownerAddress.startsWith('0x');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Owner Management
        </Button>
        
        <h1 className="text-3xl font-light text-white mb-2">Add New Owner</h1>
        <p className="text-gray-400">Add a new owner to {wallet.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Safe Info */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-3">Current Safe Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Safe Name</p>
                    <p className="text-white">{wallet.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Owners</p>
                    <p className="text-white">{wallet.owners.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Threshold</p>
                    <p className="text-white">{wallet.threshold} of {wallet.owners.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">After Addition</p>
                    <p className="text-white">{threshold} of {newTotalOwners}</p>
                  </div>
                </div>
              </div>

              {/* Owner Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Owner Address
                </label>
                <Input
                  placeholder="0x... or ENS name"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  required
                />
                {ownerAddress && !isValidAddress && (
                  <p className="text-red-400 text-xs mt-1">
                    Please enter a valid Ethereum address
                  </p>
                )}
                <p className="text-gray-400 text-sm mt-1">
                  Enter the Ethereum address of the new owner
                </p>
              </div>

              {/* New Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Confirmation Threshold
                </label>
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: newTotalOwners }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num} className="bg-gray-800">
                      {num} of {newTotalOwners} owners
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  Choose how many confirmations will be required after adding the new owner
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium mb-1">
                      Important Notice
                    </p>
                    <p className="text-yellow-300 text-xs">
                      Adding a new owner will require confirmation from existing owners. 
                      The new threshold will take effect immediately after execution.
                      Make sure the new owner address is correct as this cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Owners List */}
              <div>
                <h3 className="text-white font-medium mb-3">Current Owners</h3>
                <div className="space-y-2">
                  {wallet.owners.map((owner, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-white font-mono text-sm">
                        {owner.slice(0, 6)}...{owner.slice(-4)}
                      </span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
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
                <p className="text-gray-400 text-sm mb-1">Action</p>
                <p className="text-white">Add New Owner</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">New Owner</p>
                <p className="text-white font-mono text-sm">
                  {ownerAddress ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : '—'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Owners</p>
                <p className="text-white">
                  {wallet.owners.length} → {newTotalOwners}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">New Threshold</p>
                <p className="text-white">
                  {threshold} of {newTotalOwners}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">~0.015 ETH</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Required Confirmations</p>
                <p className="text-white">{wallet.threshold} of {wallet.owners.length}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={!isValidAddress || isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Owner
                  </>
                )}
              </Button>

              <p className="text-gray-400 text-xs text-center mt-3">
                This transaction will need {wallet.threshold} confirmations before it can be executed.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}