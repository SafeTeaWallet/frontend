import React from 'react';
import { Shield, Menu, Copy, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { SafeWallet } from '../App';

type Page = 'dashboard' | 'create-safe' | 'transaction' | 'owners';

interface HeaderProps {
  currentPage: Page;
  selectedWallet: SafeWallet;
  onNavigate: (page: Page) => void;
  onSwitchWallet: () => void;
}

export function Header({ currentPage, selectedWallet, onNavigate, onSwitchWallet }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(selectedWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'create-safe', label: 'Create Safe' },
  ] as const;

  return (
    <header className="relative z-20 border-b border-white/10">
      <div className="backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-purple-400" />
                <div className="absolute inset-0 h-8 w-8 text-purple-400 animate-pulse opacity-50" />
              </div>
              <h1 className="text-xl font-light text-white tracking-wide">
                Safe<span className="text-purple-400">Tea</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 text-sm font-light transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'text-purple-400 border-b border-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Wallet Selector */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Selected Wallet Info */}
              <button
                onClick={onSwitchWallet}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{selectedWallet.name}</p>
                    <p className="text-gray-400 text-xs font-mono">
                      {selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Copy Address Button */}
              <button
                onClick={copyAddress}
                className="p-2 hover:bg-white/10 rounded-md transition-colors"
                title="Copy wallet address"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-light transition-colors ${
                    currentPage === item.id
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Wallet Info */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    onSwitchWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-medium">{selectedWallet.name}</p>
                    <p className="text-gray-400 text-xs font-mono">
                      {selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}