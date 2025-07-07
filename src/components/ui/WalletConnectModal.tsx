import React from 'react';
import { X, Wallet, Shield, AlertTriangle } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function WalletConnectModal({ 
  isOpen, 
  onClose, 
  title = "Wallet Connection Required",
  message = "You need to connect your wallet to access this feature. Please connect your wallet to continue."
}: WalletConnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <GlassCard className="relative w-full max-w-md mx-4 p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-light text-white mb-3">{title}</h2>

          {/* Message */}
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          {/* Connect Button */}
          <div className="space-y-3">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus || authenticationStatus === 'authenticated');

                if (connected) {
                  return (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-400 mb-3">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm">Wallet Connected</span>
                      </div>
                      <Button onClick={onClose} className="w-full">
                        Continue
                      </Button>
                    </div>
                  );
                }

                return (
                  <Button
                    onClick={() => {
                      openConnectModal();
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }}
            </ConnectButton.Custom>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}