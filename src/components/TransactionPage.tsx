import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Play,
} from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { TransactionModal } from "./ui/TransactionModal";
import { useTransactionModal } from "../hooks/useTransactionModal";
import { useContracts } from "../hooks/useContracts";
import { useSafeWallets } from "../hooks/useSafeWallets";

export function TransactionPage() {
  const navigate = useNavigate();
  const { txId } = useParams<{ txId: string }>();
  const {
    confirmTransaction,
    rejectTransaction,
    executeTransaction,
    getWalletContract,
  } = useContracts();
  const {
    selectedWallet,
    selectedWalletTransactions,
    refreshWalletData,
  } = useSafeWallets();
  const { modalState, openModal, closeModal } = useTransactionModal();

  const [ownerConfirmations, setOwnerConfirmations] = useState<
    Array<{ address: string; confirmed: boolean; rejected: boolean }>
  >([]);

  const txIndex = parseInt(txId || "0");
  const rawTransaction = selectedWalletTransactions.find(
    (tx) => tx.index === txIndex
  );

  const transaction = rawTransaction
    ? {
        ...rawTransaction,
        nonce: rawTransaction.nonce ?? rawTransaction.index,
        submittedBy:
          rawTransaction.submittedBy ||
          "0x0000000000000000000000000000000000000000",
        gasLimit: rawTransaction.gasLimit || "21000",
        gasPrice: rawTransaction.gasPrice || "20 gwei",
        required: selectedWallet?.threshold || 0,
      }
    : null;

  // Fetch per-owner confirmation status
  useEffect(() => {
    const fetchOwnerConfirmations = async () => {
      if (!selectedWallet || !transaction) return;
      const walletContract = getWalletContract(selectedWallet.address);
      if (!walletContract) return;

      try {
        const results = await Promise.all(
          selectedWallet.owners.map(async (owner) => {
            const [confirmed, rejected] = await Promise.all([
              walletContract.read.hasConfirmedTransaction([
                BigInt(transaction.index),
                owner,
              ]),
              walletContract.read.hasRejectedTransaction([
                BigInt(transaction.index),
                owner,
              ]),
            ]);
            return {
              address: owner,
              confirmed: confirmed as boolean,
              rejected: rejected as boolean,
            };
          })
        );
        setOwnerConfirmations(results);
      } catch (error) {
        console.error("Error fetching owner confirmations:", error);
      }
    };

    fetchOwnerConfirmations();
  }, [selectedWallet, transaction, getWalletContract]);

  useEffect(() => {
    if (!transaction && selectedWalletTransactions.length > 0) {
      navigate("/dashboard");
    }
  }, [transaction, selectedWalletTransactions, navigate]);

  if (!transaction || !selectedWallet) return null;

  const status = transaction.executed
    ? "executed"
    : transaction.canceled
    ? "rejected"
    : "pending";

  const canConfirm =
    !transaction.executed &&
    !transaction.canceled &&
    !transaction.hasConfirmed &&
    !transaction.hasRejected;

  const canReject =
    !transaction.executed &&
    !transaction.canceled &&
    !transaction.hasRejected &&
    !transaction.hasConfirmed;

  const canExecute =
    !transaction.executed &&
    !transaction.canceled &&
    transaction.confirmations >= transaction.required;

  const createdDate = new Date(transaction.createdAt * 1000);
  const expiryDate = new Date(transaction.expiry * 1000);

  const handleConfirm = () => {
    openModal({
      title: "Confirm Transaction",
      description: `Confirm transaction #${transaction.nonce} — your vote will count toward the required ${transaction.required} confirmations.`,
      details: [
        { label: "Transaction #", value: `${transaction.nonce}` },
        { label: "Amount", value: `${transaction.value} ETH` },
        {
          label: "To",
          value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`,
        },
        {
          label: "Confirmations",
          value: `${transaction.confirmations}/${transaction.required}`,
        },
      ],
      estimatedGas: "~0.001 ETH",
      networkFee: "~$2.50",
      onConfirm: async () => {
        await confirmTransaction(selectedWallet.address, transaction.index);
        refreshWalletData();
        navigate("/dashboard");
      },
    });
  };

  const handleReject = () => {
    openModal({
      title: "Reject Transaction",
      description: `Reject transaction #${transaction.nonce}. If enough owners reject, the transaction will be permanently canceled.`,
      details: [
        { label: "Transaction #", value: `${transaction.nonce}` },
        { label: "Amount", value: `${transaction.value} ETH` },
        {
          label: "To",
          value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`,
        },
        {
          label: "Rejections",
          value: `${transaction.rejections}/${transaction.required}`,
        },
      ],
      estimatedGas: "~0.001 ETH",
      networkFee: "~$2.50",
      warningMessage:
        "If enough owners reject this transaction, it will be permanently canceled.",
      onConfirm: async () => {
        await rejectTransaction(selectedWallet.address, transaction.index);
        refreshWalletData();
        navigate("/dashboard");
      },
    });
  };

  const handleExecute = () => {
    openModal({
      title: "Execute Transaction",
      description: `Execute transaction #${transaction.nonce} — it has enough confirmations and is ready to run.`,
      details: [
        { label: "Transaction #", value: `${transaction.nonce}` },
        { label: "Amount", value: `${transaction.value} ETH` },
        {
          label: "To",
          value: `${transaction.to.slice(0, 6)}...${transaction.to.slice(-4)}`,
        },
        {
          label: "Confirmations",
          value: `${transaction.confirmations}/${transaction.required} ✓`,
        },
      ],
      estimatedGas: "~0.003 ETH",
      networkFee: "~$7.50",
      onConfirm: async () => {
        await executeTransaction(selectedWallet.address, transaction.index);
        refreshWalletData();
        navigate("/dashboard");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          Transaction #{transaction.nonce}
        </h1>
        <p className="text-gray-400">
          Created {createdDate.toLocaleDateString()} at{" "}
          {createdDate.toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-display font-light text-white mb-6">
              Transaction Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">To</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">
                      {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(transaction.to)
                      }
                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Value</p>
                  <p className="text-white text-lg font-light">
                    {transaction.value} ETH
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Expires</p>
                  <p className="text-white text-sm">
                    {expiryDate.toLocaleDateString()} at{" "}
                    {expiryDate.toLocaleTimeString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Gas Limit</p>
                  <p className="text-white">{transaction.gasLimit}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Data</p>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <code className="text-gray-300 font-mono text-sm break-all">
                    {transaction.data === "0x" || !transaction.data
                      ? "No data (simple transfer)"
                      : transaction.data}
                  </code>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Owner Confirmations */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-display font-light text-white mb-6">
              Owner Votes ({transaction.confirmations}/{transaction.required})
            </h2>

            <div className="space-y-3">
              {ownerConfirmations.length > 0 ? (
                ownerConfirmations.map((owner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          owner.confirmed
                            ? "bg-green-400"
                            : owner.rejected
                            ? "bg-red-400"
                            : "bg-gray-600"
                        }`}
                      />
                      <span className="text-white font-mono text-sm">
                        {owner.address.slice(0, 6)}...{owner.address.slice(-4)}
                      </span>
                    </div>

                    <div>
                      {owner.confirmed ? (
                        <div className="flex items-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmed
                        </div>
                      ) : owner.rejected ? (
                        <div className="flex items-center text-red-400 text-sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejected
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-400 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                selectedWallet.owners.map((owner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-600" />
                      <span className="text-white font-mono text-sm">
                        {owner.slice(0, 6)}...{owner.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Loading...
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Actions */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-display font-light text-white mb-4">
              Actions
            </h3>

            {/* Status Badge */}
            <div
              className={`p-4 rounded-xl border mb-6 ${
                status === "pending"
                  ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                  : status === "executed"
                  ? "bg-green-400/10 border-green-400/20 text-green-400"
                  : "bg-red-400/10 border-red-400/20 text-red-400"
              }`}
            >
              <div className="flex items-center space-x-2">
                {status === "pending" && <Clock className="h-4 w-4" />}
                {status === "executed" && <CheckCircle className="h-4 w-4" />}
                {status === "rejected" && <XCircle className="h-4 w-4" />}
                <span className="font-medium capitalize">{status}</span>
              </div>
              <p className="text-sm mt-1 opacity-80">
                {transaction.confirmations}/{transaction.required} confirmations
                · {transaction.rejections} rejections
              </p>
            </div>

            <div className="space-y-3">
              {canExecute && (
                <Button
                  onClick={handleExecute}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Transaction
                </Button>
              )}

              {canConfirm && (
                <Button
                  onClick={handleConfirm}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              )}

              {canReject && (
                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}

              {transaction.hasConfirmed && !transaction.executed && (
                <p className="text-green-400 text-sm text-center">
                  ✓ You have confirmed this transaction
                </p>
              )}

              {transaction.hasRejected && !transaction.canceled && (
                <p className="text-red-400 text-sm text-center">
                  ✗ You have rejected this transaction
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
              <p className="text-gray-400 text-xs">
                Transaction #{transaction.nonce}
              </p>
              <p className="text-gray-400 text-xs">
                Created: {createdDate.toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-xs">
                Expires: {expiryDate.toLocaleDateString()}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
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
