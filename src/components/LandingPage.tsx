import React from 'react';
import { Shield, Users, Lock, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

interface LandingPageProps {
  onConnect: () => void;
}

export function LandingPage({ onConnect }: LandingPageProps) {
  const features = [
    {
      icon: Shield,
      title: 'Multi-Signature Security',
      description: 'Require multiple confirmations before executing any transaction, ensuring maximum security for your digital assets.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage shared wallets with your team, organization, or DAO with customizable ownership and threshold settings.'
    },
    {
      icon: Lock,
      title: 'Non-Custodial',
      description: 'You maintain full control of your private keys. SafeTea never has access to your funds or personal information.'
    },
    {
      icon: Zap,
      title: 'Gas Optimized',
      description: 'Built with efficiency in mind, minimizing transaction costs while maintaining the highest security standards.'
    }
  ];

  const stats = [
    { value: '$2.5B+', label: 'Assets Secured' },
    { value: '50K+', label: 'Active Safes' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Shield className="h-16 w-16 text-purple-400" />
                <div className="absolute inset-0 h-16 w-16 text-purple-400 animate-pulse opacity-50" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-white mb-6 tracking-tight">
              Safe<span className="text-purple-400">Tea</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto font-light">
              The most secure and user-friendly multi-signature wallet for teams and organizations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={onConnect}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-8 py-4 text-lg"
              >
                Connect Wallet
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                Audited by OpenZeppelin
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                Open Source
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                Battle Tested
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* Stats Section */}
      <div className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-light text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              Why Choose SafeTea?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for security, designed for simplicity. SafeTea combines enterprise-grade security with an intuitive user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-6 text-center hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <feature.icon className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-white font-medium mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started with SafeTea in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                1
              </div>
              <h3 className="text-white font-medium mb-3">Create Your Safe</h3>
              <p className="text-gray-400 text-sm">
                Set up your multi-signature wallet by adding owners and defining the confirmation threshold.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                2
              </div>
              <h3 className="text-white font-medium mb-3">Submit Transactions</h3>
              <p className="text-gray-400 text-sm">
                Any owner can propose transactions, whether it's sending ETH, tokens, or interacting with smart contracts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                3
              </div>
              <h3 className="text-white font-medium mb-3">Confirm & Execute</h3>
              <p className="text-gray-400 text-sm">
                Once enough owners confirm the transaction, it can be executed safely and securely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlassCard className="p-12">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Ready to Secure Your Assets?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of teams and organizations who trust SafeTea to protect their digital assets.
            </p>
            <Button
              onClick={onConnect}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-8 py-4 text-lg"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}