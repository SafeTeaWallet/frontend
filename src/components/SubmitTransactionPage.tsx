import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBalance, usePublicClient } from "wagmi";
import { parseUnits, formatEther } from "viem";
import { ArrowLeft, Send, Coins } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TokenSelector } from "./ui/TokenSelector";
import { TransactionModal } from "./ui/TransactionModal";
import { useTransactionModal } from "../hooks/useTransactionModal";
import { Token, SafeWallet } from "../App";
import { useContracts } from "../hooks/useContracts";
import { useTokenBalance } from "../hooks/useTokenBalance";

interface SubmitTransactionPageProps {
  wallet: SafeWallet;
  tokens: Token[];
  onAddToken: (token: Token) => void;
}

export function SubmitTransactionPage({
  wallet,
  tokens,
  onAddToken,
}: SubmitTransactionPageProps) {
  const navigate = useNavigate();
  const { submitTransaction, submitTokenTransfer } = useContracts();
  const { modalState, openModal, closeModal } = useTransactionModal();
  const publicClient = usePublicClient();

  const [transactionType, setTransactionType] = useState<"legacy" | "token">(
    "legacy"
  );
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [customData, setCustomData] = useState("");
  const [gasEstimate, setGasEstimate] = useState<string>("0.002");

  const { data: balance } = useBalance({
    address: wallet?.address as `0x${string}`,
  });

  const { balance: tokenBalance } = useTokenBalance(
    selectedToken?.address || "",
    wallet?.address || "",
    selectedToken?.decimals || 18
  );

  // Estimate gas
  useEffect(() => {
    const estimateGas = async () => {
      if (!publicClient || !recipient || !amount || !wallet) return;
      try {
        let gas: bigint;
        if (transactionType === "legacy") {
          gas = await publicClient.estimateGas({
            account: wallet.address as `0x${string}`,
            to: recipient as `0x${string}`,
            value: parseUnits(amount, 18),
            data: (customData || "0x") as `0x${string}`,
          });
        } else if (selectedToken) {
          // Estimate gas for the multisig submitTransaction call
          gas = BigInt(100000); // safe default for token transfers via multisig
        } else {
          return;
        }
        const gasPrice = await publicClient.getGasPrice();
        setGasEstimate(formatEther(gas * gasPrice));
      } catch {
        setGasEstimate(transactionType === "legacy" ? "0.002" : "0.005");
      }
    };

    if (recipient && amount) estimateGas();
  }, [recipient, amount, transactionType, selectedToken, customData, publicClient, wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;

    const details = [
      {
        label: "Type",
        value: transactionType === "legacy" ? "ETH Transfer" : "Token Transfer",
      },
      {
        label: "To",
        value: `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      },
      {
        label: "Amount",
        value: `${amount} ${
          transactionType === "legacy"
            ? "ETH"
            : selectedToken?.symbol || "TOKEN"
        }`,
      },
    ];

    if (transactionType === "token" && selectedToken) {
      details.push({ label: "Token", value: selectedToken.name });
    }

    openModal({
      title: "Submit Transaction",
      description:
        "This will create a new transaction proposal that requires confirmation from other wallet owners.",
      details,
      estimatedGas: `~${parseFloat(gasEstimate).toFixed(6)} ETH`,
      networkFee: `~$${(parseFloat(gasEstimate) * 2500).toFixed(2)}`,
      warningMessage:
        "Make sure the recipient address is correct. This transaction will need approval from other owners.",
      onConfirm: async () => {
        if (transactionType === "legacy") {
          await submitTransaction(
            wallet.address,
            recipient,
            amount,
            customData || "0x"
          );
        } else if (selectedToken) {
          const rawAmount = parseUnits(amount, selectedToken.decimals);
          await submitTokenTransfer(
            wallet.address,
            selectedToken.address,
            recipient,
            rawAmount
          );
        }
      },
    });
  };

  const ethBalance = balance
    ? (parseFloat(balance.value.toString()) / 1e18).toFixed(4)
    : wallet?.ethBalance || "0";
  const selectedBalance =
    transactionType === "legacy" ? ethBalance : tokenBalance || "0";

  const handleMaxClick = () => {
    if (transactionType === "legacy") {
      const max = Math.max(0, parseFloat(ethBalance) - parseFloat(gasEstimate));
      setAmount(max.toFixed(6));
    } else {
      setAmount(selectedBalance.replace(/,/g, ""));
    }
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
          Submit Transaction
        </h1>
        <p className="text-gray-400">
          Create a new transaction for your SafeTea wallet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6" overflow>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Transaction Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType("legacy")}
                    className={`p-6 rounded-xl border transition-all ${
                      transactionType === "legacy"
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-white/20 bg-white/5 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold font-display">ETH</span>
                      </div>
                      <p className="font-display font-medium text-lg mb-1">
                        ETH Transfer
                      </p>
                      <p className="text-sm opacity-80">Send ETH to any address</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransactionType("token")}
                    className={`p-6 rounded-xl border transition-all ${
                      transactionType === "token"
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-white/20 bg-white/5 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    <div className="text-center">
                      <Coins className="w-12 h-12 mx-auto mb-3" />
                      <p className="font-display font-medium text-lg mb-1">
                        Token Transfer
                      </p>
                      <p className="text-sm opacity-80">Send ERC-20 tokens</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Enter the destination Ethereum address
                </p>
              </div>

              {/* Token Selection */}
              {transactionType === "token" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Token
                  </label>
                  <TokenSelector
                    tokens={tokens}
                    selectedToken={selectedToken}
                    onSelectToken={setSelectedToken}
                    onAddToken={onAddToken}
                    placeholder="Choose a token to send"
                  />
                </div>
              )}

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Max:{" "}
                    {parseFloat(selectedBalance).toFixed(4)}{" "}
                    {transactionType === "legacy"
                      ? "ETH"
                      : selectedToken?.symbol || "TOKEN"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    {transactionType === "legacy"
                      ? "ETH"
                      : selectedToken?.symbol || "TOKEN"}
                  </div>
                </div>
              </div>

              {/* Custom Data (ETH only) */}
              {transactionType === "legacy" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data{" "}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="0x... (for contract interactions)"
                    value={customData}
                    onChange={(e) => setCustomData(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Leave empty for simple ETH transfers
                  </p>
                </div>
              )}
            </form>
          </GlassCard>
        </div>

        {/* Summary */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h3 className="text-lg font-display font-light text-white mb-4">
              Summary
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Type</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm ${
                    transactionType === "legacy"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {transactionType === "legacy" ? "ETH Transfer" : "Token Transfer"}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">To</p>
                <p className="text-white font-mono text-sm">
                  {recipient
                    ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}`
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Amount</p>
                <p className="text-white text-lg">
                  {amount || "0"}{" "}
                  {transactionType === "legacy"
                    ? "ETH"
                    : selectedToken?.symbol || "TOKEN"}
                </p>
              </div>

              {transactionType === "token" && selectedToken && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Token</p>
                  <p className="text-white">{selectedToken.name}</p>
                </div>
              )}

              <div>
                <p className="text-gray-400 text-sm mb-1">Est. Gas</p>
                <p className="text-white">
                  ~{parseFloat(gasEstimate).toFixed(6)} ETH
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                onClick={handleSubmit}
                disabled={
                  !recipient ||
                  !amount ||
                  (transactionType === "token" && !selectedToken)
                }
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Transaction
              </Button>

              <p className="text-gray-500 text-xs text-center mt-3">
                Requires {wallet.threshold} of {wallet.owners.length} owner
                confirmations
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={() => navigate("/dashboard")}
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
