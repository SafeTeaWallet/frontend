import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, AlertTriangle, Users } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TransactionModal } from "./ui/TransactionModal";
import { useTransactionModal } from "../hooks/useTransactionModal";
import { useContracts, OwnerProposalType } from "../hooks/useContracts";
import { SafeWallet } from "../App";

interface AddOwnerPageProps {
  wallet: SafeWallet;
}

export function AddOwnerPage({ wallet }: AddOwnerPageProps) {
  const navigate = useNavigate();
  const { modalState, openModal, closeModal } = useTransactionModal();
  const { proposeOwner } = useContracts();
  const [ownerAddress, setOwnerAddress] = useState("");

  const newTotalOwners = wallet.owners.length + 1;
  const isValidAddress =
    ownerAddress.length === 42 && ownerAddress.startsWith("0x");
  const isAlreadyOwner = wallet.owners
    .map((o) => o.toLowerCase())
    .includes(ownerAddress.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidAddress || isAlreadyOwner) return;

    openModal({
      title: "Propose New Owner",
      description:
        "This will create an on-chain proposal to add a new owner. Existing owners must confirm before the change takes effect.",
      details: [
        {
          label: "New Owner",
          value: `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`,
        },
        { label: "Current Owners", value: wallet.owners.length.toString() },
        { label: "After Addition", value: newTotalOwners.toString() },
        {
          label: "Required Confirmations",
          value: `${wallet.threshold} of ${wallet.owners.length}`,
        },
      ],
      estimatedGas: "~0.003 ETH",
      networkFee: "~$7.50",
      warningMessage:
        "This proposal needs confirmation from existing owners before the new owner is added.",
      onConfirm: async () => {
        await proposeOwner(
          wallet.address,
          ownerAddress,
          OwnerProposalType.Add
        );
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/owners")}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Owner Management
        </Button>

        <h1 className="text-3xl font-display font-light text-white mb-2">
          Add New Owner
        </h1>
        <p className="text-gray-400">Add a new owner to {wallet.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Safe Info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-3">
                  Current Configuration
                </h3>
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
                    <p className="text-gray-400">Threshold</p>
                    <p className="text-white">
                      {wallet.threshold} of {wallet.owners.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">After Addition</p>
                    <p className="text-white">
                      {wallet.threshold} of {newTotalOwners}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Owner Address
                </label>
                <Input
                  placeholder="0x..."
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  required
                  error={
                    ownerAddress && !isValidAddress
                      ? "Enter a valid Ethereum address"
                      : isAlreadyOwner
                      ? "This address is already an owner"
                      : undefined
                  }
                />
                <p className="text-gray-500 text-xs mt-1">
                  Enter the Ethereum address of the new owner
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium mb-1">
                      Important
                    </p>
                    <p className="text-yellow-300 text-xs">
                      Adding a new owner requires confirmation from{" "}
                      {wallet.threshold} existing owner
                      {wallet.threshold !== 1 ? "s" : ""}. The threshold
                      automatically adjusts to majority after the change.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Owners */}
              <div>
                <h3 className="text-white font-medium mb-3">Current Owners</h3>
                <div className="space-y-2">
                  {wallet.owners.map((owner, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white font-mono text-sm flex-1">
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
            <h3 className="text-lg font-display font-light text-white mb-4">
              Proposal Summary
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Action</p>
                <p className="text-white">Add New Owner</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">New Owner</p>
                <p className="text-white font-mono text-sm">
                  {ownerAddress
                    ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Total Owners</p>
                <p className="text-white">
                  {wallet.owners.length} → {newTotalOwners}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">~0.003 ETH</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">
                  Required Confirmations
                </p>
                <p className="text-white">
                  {wallet.threshold} of {wallet.owners.length}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                onClick={handleSubmit}
                disabled={!isValidAddress || isAlreadyOwner}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Propose Owner
              </Button>

              <p className="text-gray-500 text-xs text-center mt-3">
                Requires {wallet.threshold} confirmation
                {wallet.threshold !== 1 ? "s" : ""} to execute
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={() => navigate("/owners")}
        title={modalState.title}
        description={modalState.description}
        transactionHash={modalState.transactionHash}
        onConfirm={modalState.onConfirm || (() => Promise.resolve())}
        estimatedGas={modalState.estimatedGas}
        networkFee={modalState.networkFee}
        details={modalState.details}
        warningMessage={modalState.warningMessage}
      />
    </div>
  );
}
