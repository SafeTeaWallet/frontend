import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Shield } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TransactionModal } from "./ui/TransactionModal";
import { useTransactionModal } from "../hooks/useTransactionModal";

interface CreateSafeProps {
  onSafeCreated: (owners: string[], safeName: string) => Promise<void>;
}

export function CreateSafe({ onSafeCreated }: CreateSafeProps) {
  const navigate = useNavigate();
  const { modalState, openModal, closeModal } = useTransactionModal();
  const [safeName, setSafeName] = useState("");
  const [owners, setOwners] = useState<string[]>([""]);
  const [threshold, setThreshold] = useState(1);

  const addOwner = () => {
    setOwners([...owners, ""]);
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      setOwners(owners.filter((_, i) => i !== index));
      if (threshold > owners.length - 1) {
        setThreshold(owners.length - 1);
      }
    }
  };

  const updateOwner = (index: number, value: string) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  const handleCreateSafe = async () => {
    openModal({
      title: "Create New Safe",
      description: "This will deploy a new multi-signature wallet on the blockchain.",
      details: [
        { label: "Safe Name", value: safeName || "New Safe" },
        { label: "Owners", value: `${validOwners.length} addresses` },
        { label: "Threshold", value: `${threshold} of ${validOwners.length}` },
        { label: "Network", value: "Ethereum" },
      ],
      estimatedGas: "~0.02 ETH",
      networkFee: "~$50.00",
      warningMessage: "Make sure all owner addresses are correct. This cannot be easily changed later.",
      onConfirm: async () => {
        await onSafeCreated(validOwners, safeName || "New Safe");
      },
    });
  };

  const validOwners = owners.filter((owner) => owner.trim() !== "");
  const canCreate =
    safeName.trim() !== "" &&
    validOwners.length >= 1 &&
    threshold > 0 &&
    threshold <= validOwners.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/wallets')}
          className="mb-4 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wallet Selection
        </Button>

        <h1 className="text-3xl font-display font-light text-white mb-2">Create New Safe</h1>
        <p className="text-gray-400">
          Set up a new multi-signature wallet with your team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="space-y-8">
              {/* Safe Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Safe Name
                </label>
                <Input
                  placeholder="e.g., Team Treasury, Marketing Fund"
                  value={safeName}
                  onChange={(e) => setSafeName(e.target.value)}
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Choose a descriptive name for your Safe wallet
                </p>
              </div>

              {/* Owners Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-light text-white">Safe Owners</h2>
                  <Button variant="outline" size="sm" onClick={addOwner}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Owner
                  </Button>
                </div>

                <div className="space-y-3">
                  {owners.map((owner, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <Input
                          placeholder="0x... or ENS name"
                          value={owner}
                          onChange={(e) => updateOwner(index, e.target.value)}
                        />
                      </div>
                      {owners.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOwner(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-gray-400 text-sm mt-2">
                  Add the addresses of all Safe owners. Each owner can submit
                  and confirm transactions.
                </p>
              </div>

              {/* Threshold Section */}
              <div>
                <h2 className="text-xl font-light text-white mb-5">
                  Confirmation Threshold
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 font-medium">Require</span>
                    <span className="text-white font-semibold">
                      51% of owners
                    </span>
                    <span className="text-gray-400">
                      to confirm (out of {validOwners.length} owner
                      {validOwners.length !== 1 ? "s" : ""})
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm max-w-md">
                    Transactions need confirmation from a{" "}
                    <span className="text-white font-semibold">
                      majority of owners
                    </span>{" "}
                    before they can be executed.
                  </p>
                </div>
              </div>

              {/* Create Button */}
              <div className="pt-4">
                <Button
                  onClick={handleCreateSafe}
                  disabled={!canCreate}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Create Safe
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-light text-white mb-4">Summary</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Safe Name</p>
                <p className="text-white">{safeName || "Unnamed Safe"}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Owners</p>
                <p className="text-white">{validOwners.length}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Threshold</p>
                <p className="text-white">
                  {threshold} of {validOwners.length}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Network</p>
                <p className="text-white">Ethereum Mainnet</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-2">Estimated Gas Cost</p>
                <p className="text-white">~0.02 ETH</p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                💡 Your Safe will be deployed on-chain once you confirm the
                transaction in your wallet.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={() => navigate('/wallets')}
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
