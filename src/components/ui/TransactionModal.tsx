import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useWaitForTransactionReceipt, useAccount } from 'wagmi';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title: string;
  description: string;
  /** onConfirm should return the tx hash string, or void if the hash is tracked externally */
  onConfirm: () => Promise<`0x${string}` | void>;
  estimatedGas?: string;
  networkFee?: string;
  details?: Array<{ label: string; value: string }>;
  warningMessage?: string;
}

type Step = 'confirm' | 'approving' | 'mining' | 'success' | 'error';

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  onConfirm,
  estimatedGas = '~0.002 ETH',
  networkFee,
  details = [],
  warningMessage,
}: TransactionModalProps) {
  const { chain } = useAccount();
  const [step, setStep] = useState<Step>('confirm');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Wait for the tx to be mined once we have a hash
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  // Transition to success only when the receipt arrives
  useEffect(() => {
    if (receipt) setStep('success');
  }, [receipt]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setTxHash(undefined);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setError(null);
    setStep('approving'); // waiting for wallet popup approval

    try {
      const hash = await onConfirm(); // blocks until user approves in wallet
      if (hash) {
        setTxHash(hash);
        setStep('mining'); // tx submitted, waiting for block confirmation
      } else {
        // onConfirm didn't return a hash — treat as instant success
        setStep('success');
      }
    } catch (err: any) {
      const msg: string = err?.shortMessage || err?.message || 'Transaction failed';
      // User rejected in wallet
      if (
        msg.toLowerCase().includes('user rejected') ||
        msg.toLowerCase().includes('user denied') ||
        err?.code === 4001
      ) {
        setError('Transaction rejected in wallet.');
      } else {
        setError(msg);
      }
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'approving' || step === 'mining') return;
    onClose();
  };

  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  const explorerUrl = (hash: string) => {
    if (chain?.id === 11155111) return `https://sepolia.etherscan.io/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  const copyHash = () => txHash && navigator.clipboard.writeText(txHash);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d12] shadow-2xl shadow-black/60 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <h2 className="text-base font-display font-medium text-white">{title}</h2>
            {step !== 'approving' && step !== 'mining' && (
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="px-6 py-5">

            {/* ── Confirm ─────────────────────────────────────────────── */}
            {step === 'confirm' && (
              <>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{description}</p>

                {/* Details */}
                {details.length > 0 && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05] mb-4">
                    {details.map((d, i) => (
                      <div key={i} className="flex justify-between items-center px-4 py-3">
                        <span className="text-gray-500 text-xs">{d.label}</span>
                        <span className="text-white text-xs font-medium font-mono">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gas */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05] mb-4">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-gray-500 text-xs">Estimated gas</span>
                    <span className="text-white text-xs font-mono">{estimatedGas}</span>
                  </div>
                  {networkFee && (
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-gray-500 text-xs">Network fee</span>
                      <span className="text-white text-xs font-mono">{networkFee}</span>
                    </div>
                  )}
                </div>

                {/* Warning */}
                {warningMessage && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20 mb-4">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-300/80 text-xs leading-relaxed">{warningMessage}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={handleClose} className="flex-1 text-sm">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}

            {/* ── Approving (wallet popup open) ────────────────────────── */}
            {step === 'approving' && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                </div>
                <p className="text-white font-medium mb-2">Waiting for approval</p>
                <p className="text-gray-500 text-sm">Confirm the transaction in your wallet</p>
              </div>
            )}

            {/* ── Mining (tx submitted, waiting for block) ─────────────── */}
            {step === 'mining' && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                </div>
                <p className="text-white font-medium mb-1">Transaction submitted</p>
                <p className="text-gray-500 text-sm mb-5">Waiting for block confirmation on Sepolia…</p>

                {txHash && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-xs">Tx hash</span>
                      <div className="flex gap-1.5">
                        <button onClick={copyHash} className="p-1 rounded hover:bg-white/[0.06] transition-colors">
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <a
                          href={explorerUrl(txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-white/[0.06] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      </div>
                    </div>
                    <p className="text-white/60 font-mono text-[11px] break-all">{txHash}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Success ──────────────────────────────────────────────── */}
            {step === 'success' && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-white font-medium mb-1">Transaction confirmed</p>
                <p className="text-gray-500 text-sm mb-5">Your transaction was included in a block.</p>

                {txHash && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-xs">Tx hash</span>
                      <div className="flex gap-1.5">
                        <button onClick={copyHash} className="p-1 rounded hover:bg-white/[0.06] transition-colors">
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <a
                          href={explorerUrl(txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-white/[0.06] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                        </a>
                      </div>
                    </div>
                    <p className="text-white/60 font-mono text-[11px] break-all">{txHash}</p>
                  </div>
                )}

                <Button
                  onClick={handleSuccess}
                  className="w-full text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                >
                  Done
                </Button>
              </div>
            )}

            {/* ── Error ────────────────────────────────────────────────── */}
            {step === 'error' && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                  <X className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-white font-medium mb-1">Transaction failed</p>
                <p className="text-gray-500 text-sm mb-5 break-words">{error}</p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1 text-sm">
                    Close
                  </Button>
                  <Button
                    onClick={() => setStep('confirm')}
                    className="flex-1 text-sm bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
