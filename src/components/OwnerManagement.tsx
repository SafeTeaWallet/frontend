import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Copy, UserPlus, Users } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { SafeWallet } from "../App";
import { useAccount } from "wagmi";

interface OwnerManagementProps {
  wallet: SafeWallet;
}

export function OwnerManagement({ wallet }: OwnerManagementProps) {
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();

  const copyAddress = (addr: string) => navigator.clipboard.writeText(addr);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-display font-light text-white mb-2">
          Owner Management
        </h1>
        <p className="text-gray-400">
          Manage the owners and settings of {wallet.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-display font-light text-white mb-4">
              Safe Info
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Safe Name</p>
                <p className="text-white">{wallet.name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Owners</p>
                <p className="text-white text-xl">{wallet.owners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Threshold</p>
                <p className="text-white text-xl">
                  {wallet.threshold}/{wallet.owners.length}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                <p className="text-white text-xl">{wallet.totalTransactions}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Created</p>
                <p className="text-white">
                  {new Date(wallet.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/add-owner")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Owners List */}
        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-light text-white">
                Safe Owners
              </h2>
              <span className="text-gray-400 text-sm">
                {wallet.owners.length} owner
                {wallet.owners.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {wallet.owners.map((owner, index) => {
                const isYou =
                  connectedAddress?.toLowerCase() === owner.toLowerCase();
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Avatar placeholder */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-700/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-purple-400" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-medium">
                            {isYou ? "You" : `Owner ${index + 1}`}
                          </span>
                          {isYou && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                              Connected
                            </span>
                          )}
                          {index === 0 && !isYou && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                              Creator
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 font-mono text-sm">
                            {owner.slice(0, 8)}...{owner.slice(-6)}
                          </span>
                          <button
                            onClick={() => copyAddress(owner)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                            title="Copy address"
                          >
                            <Copy className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Threshold Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-start space-x-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Users className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-purple-400 font-medium mb-1">
                    Confirmation Threshold
                  </p>
                  <p className="text-purple-300 text-sm">
                    Transactions require{" "}
                    <span className="text-white font-semibold">
                      {wallet.threshold} of {wallet.owners.length}
                    </span>{" "}
                    owner confirmations (majority rule). The threshold
                    automatically adjusts when owners are added or removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Add Owner CTA */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">Add New Owner</h3>
                <p className="text-gray-400 text-sm">
                  Propose adding a new owner — requires existing owner
                  confirmations
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/add-owner")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Owner
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
