import React, { useState } from 'react';
import { ArrowLeft, Settings, AlertTriangle, Shield } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { SafeWallet } from '../App';

interface ChangeThresholdPageProps {
  wallet: SafeWallet;
  onBack: () => void;
  onSubmit: () => void;
}

export function ChangeThresholdPage({ wallet, onBack, onSubmit }: ChangeThresholdPageProps) {
  const [newThreshold, setNewThreshold] = useState(wallet.threshold);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate transaction submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onSubmit();
  };

  const getSecurityLevel = (threshold: number, total: number) => {
    const percentage = (threshold / total) * 100;
    if (percentage <= 33) return { level: 'Low', color: 'text-red-400', bg: 'bg-red-400/10' };
    if (percentage <= 66) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { level: 'High', color: 'text-green-400', bg: 'bg-green-400/10' };
  };

  const currentSecurity = getSecurityLevel(wallet.threshold, wallet.owners.length);
  const newSecurity = getSecurityLevel(newThreshold, wallet.owners.length);

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
        
        <h1 className="text-3xl font-light text-white mb-2">Change Threshold</h1>
        <p className="text-gray-400">Modify the confirmation threshold for {wallet.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Settings */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-3">Current Settings</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Safe Name</p>
                    <p className="text-white">{wallet.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Owners</p>
                    <p className="text-white">{wallet.owners.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Current Threshold</p>
                    <p className="text-white">{wallet.threshold} of {wallet.owners.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Security Level</p>
                    <span className={`${currentSecurity.color} px-2 py-1 rounded text-xs ${currentSecurity.bg}`}>
                      {currentSecurity.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Threshold Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  New Confirmation Threshold
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                  {Array.from({ length: wallet.owners.length }, (_, i) => i + 1).map(num => {
                    const security = getSecurityLevel(num, wallet.owners.length);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewThreshold(num)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          newThreshold === num
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/20 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">
                              {num} of {wallet.owners.length} owners
                            </p>
                            <p className="text-gray-400 text-sm">
                              {((num / wallet.owners.length) * 100).toFixed(0)}% consensus required
                            </p>
                          </div>
                          <span className={`${security.color} px-2 py-1 rounded text-xs ${security.bg}`}>
                            {security.level}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Impact */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-3">Security Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Current Security:</span>
                    <span className={`${currentSecurity.color} px-2 py-1 rounded text-xs ${currentSecurity.bg}`}>
                      {currentSecurity.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">New Security:</span>
                    <span className={`${newSecurity.color} px-2 py-1 rounded text-xs ${newSecurity.bg}`}>
                      {newSecurity.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {newThreshold === 1 && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 text-sm font-medium mb-1">
                        Low Security Warning
                      </p>
                      <p className="text-red-300 text-xs">
                        A threshold of 1 means any single owner can execute transactions. 
                        Consider using a higher threshold for better security.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {newThreshold === wallet.owners.length && wallet.owners.length > 2 && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium mb-1">
                        High Security Notice
                      </p>
                      <p className="text-yellow-300 text-xs">
                        Requiring all owners to confirm may make it difficult to execute 
                        transactions if any owner is unavailable.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Owners List */}
              <div>
                <h3 className="text-white font-medium mb-3">Current Owners</h3>
                <div className="space-y-2">
                  {wallet.owners.map((owner, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <Shield className="h-4 w-4 text-gray-400" />
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
                <p className="text-white">Change Threshold</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Current</p>
                <p className="text-white">{wallet.threshold} of {wallet.owners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">New</p>
                <p className="text-white">{newThreshold} of {wallet.owners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Security Change</p>
                <div className="flex items-center space-x-2">
                  <span className={`${currentSecurity.color} text-xs`}>{currentSecurity.level}</span>
                  <span className="text-gray-400">→</span>
                  <span className={`${newSecurity.color} text-xs`}>{newSecurity.level}</span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">~0.008 ETH</p>
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
                disabled={newThreshold === wallet.threshold || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Change Threshold
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