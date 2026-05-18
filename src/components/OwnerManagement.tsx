import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Copy, UserPlus, UserMinus, CheckCircle,
  XCircle, Clock, RefreshCw, AlertTriangle, Users,
} from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TransactionModal } from "./ui/TransactionModal";
import { useTransactionModal } from "../hooks/useTransactionModal";
import { useContracts, OwnerProposalType, OwnerProposalData } from "../hooks/useContracts";
import { SafeWallet } from "../App";
import { useAccount } from "wagmi";

interface Props { wallet: SafeWallet; }

type Tab = "owners" | "proposals";
type ProposalAction = "add" | "remove";

export function OwnerManagement({ wallet }: Props) {
  const navigate = useNavigate();
  const { address: me } = useAccount();
  const {
    getOwnerProposals, proposeOwner,
    confirmOwnerProposal, rejectOwnerProposal, markOwnerProposalExpired,
  } = useContracts();
  const { modalState, openModal, closeModal } = useTransactionModal();

  const [tab, setTab] = useState<Tab>("owners");
  const [proposals, setProposals] = useState<OwnerProposalData[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Propose form state
  const [action, setAction] = useState<ProposalAction>("add");
  const [targetAddress, setTargetAddress] = useState("");

  const isValidAddress = targetAddress.length === 42 && targetAddress.startsWith("0x");
  const isAlreadyOwner = wallet.owners.map(o => o.toLowerCase()).includes(targetAddress.toLowerCase());
  const isNotOwner = !isAlreadyOwner && targetAddress.length > 0;

  const addressError = targetAddress && !isValidAddress
    ? "Enter a valid Ethereum address"
    : action === "add" && isAlreadyOwner
    ? "This address is already an owner"
    : action === "remove" && targetAddress && isValidAddress && isNotOwner
    ? "This address is not an owner"
    : undefined;

  const canPropose = isValidAddress && !addressError;

  const loadProposals = useCallback(async () => {
    setLoadingProposals(true);
    try {
      const data = await getOwnerProposals(wallet.address);
      setProposals(data);
    } finally {
      setLoadingProposals(false);
    }
  }, [wallet.address]); // intentionally omit getOwnerProposals — it's stable enough and including it causes infinite loops

  useEffect(() => { loadProposals(); }, [loadProposals]);

  const copy = (addr: string) => navigator.clipboard.writeText(addr);
  const fmt = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  // Stable timestamp — only recalculate when proposals change, not on every render
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => { setNow(Math.floor(Date.now() / 1000)); }, [proposals]);

  const pendingProposals = proposals.filter(p => !p.executed && !p.canceled);
  const pastProposals = proposals.filter(p => p.executed || p.canceled);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handlePropose = () => {
    const type = action === "add" ? OwnerProposalType.Add : OwnerProposalType.Remove;
    const label = action === "add" ? "Add Owner" : "Remove Owner";
    openModal({
      title: `Propose: ${label}`,
      description: action === "add"
        ? "This creates an on-chain proposal to add a new owner. Existing owners must reach majority to execute it."
        : "This creates an on-chain proposal to remove an owner. Majority confirmation required.",
      details: [
        { label: "Action", value: label },
        { label: "Address", value: fmt(targetAddress) },
        { label: "Current owners", value: wallet.owners.length.toString() },
        { label: "Threshold", value: `${wallet.threshold} of ${wallet.owners.length}` },
      ],
      estimatedGas: "~0.003 ETH",
      warningMessage: action === "remove" && wallet.owners.length <= 2
        ? "Cannot remove — minimum 2 owners required by the contract."
        : undefined,
      onConfirm: async () => {
        const hash = await proposeOwner(wallet.address, targetAddress, type);
        setTargetAddress("");
        return hash;
      },
    });
  };

  const handleConfirmProposal = (p: OwnerProposalData) => {
    const isAdd = !wallet.owners.map(o => o.toLowerCase()).includes(p.proposedOwner.toLowerCase());
    openModal({
      title: "Confirm Proposal",
      description: `Confirm the proposal to ${isAdd ? "add" : "remove"} ${fmt(p.proposedOwner)}.`,
      details: [
        { label: "Action", value: isAdd ? "Add Owner" : "Remove Owner" },
        { label: "Proposed owner", value: fmt(p.proposedOwner) },
        { label: "Confirmations", value: `${p.confirmations} / ${wallet.threshold}` },
      ],
      estimatedGas: "~0.001 ETH",
      onConfirm: () => confirmOwnerProposal(wallet.address, p.index),
    });
  };

  const handleRejectProposal = (p: OwnerProposalData) => {
    openModal({
      title: "Reject Proposal",
      description: `Reject the proposal for ${fmt(p.proposedOwner)}. If majority rejects, it will be canceled.`,
      details: [
        { label: "Proposed owner", value: fmt(p.proposedOwner) },
        { label: "Rejections", value: `${p.rejections} / ${wallet.threshold}` },
      ],
      estimatedGas: "~0.001 ETH",
      warningMessage: "If enough owners reject, this proposal will be permanently canceled.",
      onConfirm: () => rejectOwnerProposal(wallet.address, p.index),
    });
  };

  const handleMarkExpired = (p: OwnerProposalData) => {
    openModal({
      title: "Mark Proposal Expired",
      description: "This proposal has passed its expiry. Mark it as expired to clean up the queue.",
      details: [{ label: "Proposal #", value: p.index.toString() }],
      estimatedGas: "~0.0005 ETH",
      onConfirm: () => markOwnerProposalExpired(wallet.address, p.index),
    });
  };

  const proposalStatus = (p: OwnerProposalData) => {
    if (p.executed) return { label: "Executed", cls: "text-green-400 bg-green-400/10 border-green-400/20" };
    if (p.canceled) return { label: "Canceled", cls: "text-red-400 bg-red-400/10 border-red-400/20" };
    if (p.expiry < now) return { label: "Expired", cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    return { label: "Pending", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
  };


  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-light text-white mb-1">Owner Management</h1>
            <p className="text-gray-500 text-sm">{wallet.name} · {fmt(wallet.address)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadProposals} className="mt-1">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Owners", value: wallet.owners.length },
          { label: "Threshold", value: `${wallet.threshold} / ${wallet.owners.length}` },
          { label: "Pending proposals", value: pendingProposals.length },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 text-center">
            <p className="text-2xl font-display font-light text-white mb-1">{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07] mb-6 w-fit">
        {(["owners", "proposals"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t}
            {t === "proposals" && pendingProposals.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px]">
                {pendingProposals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Owners tab ──────────────────────────────────────────────────────── */}
      {tab === "owners" && (
        <div className="space-y-6">
          {/* Owner list */}
          <GlassCard className="p-6">
            <h2 className="text-base font-display font-medium text-white mb-5">
              Current Owners <span className="text-gray-500 font-normal text-sm ml-1">({wallet.owners.length})</span>
            </h2>
            <div className="space-y-2">
              {wallet.owners.map((owner, i) => {
                const isMe = me?.toLowerCase() === owner.toLowerCase();
                return (
                  <div key={owner} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{isMe ? "You" : `Owner ${i + 1}`}</span>
                          {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">Connected</span>}
                        </div>
                        <span className="text-gray-500 font-mono text-xs">{owner}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-green-400 text-xs">Active</span>
                      <button onClick={() => copy(owner)} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ml-1">
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-start gap-3 p-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/20">
              <Users className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-purple-300/80 text-xs leading-relaxed">
                Majority threshold: <span className="text-white font-medium">{wallet.threshold} of {wallet.owners.length}</span> confirmations required. Threshold auto-adjusts when owners change.
              </p>
            </div>
          </GlassCard>

          {/* Propose form */}
          <GlassCard className="p-6">
            <h2 className="text-base font-display font-medium text-white mb-5">Propose Owner Change</h2>

            {/* Action toggle */}
            <div className="flex gap-2 mb-5">
              {(["add", "remove"] as ProposalAction[]).map(a => (
                <button
                  key={a}
                  onClick={() => { setAction(a); setTargetAddress(""); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    action === a
                      ? a === "add"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-white"
                  }`}
                >
                  {a === "add" ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                  {a === "add" ? "Add Owner" : "Remove Owner"}
                </button>
              ))}
            </div>

            {action === "remove" && wallet.owners.length <= 2 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/[0.07] border border-red-500/20 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300/80 text-xs">Cannot remove — the contract requires a minimum of 2 owners.</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  {action === "add" ? "New owner address" : "Owner address to remove"}
                </label>
                <Input
                  placeholder="0x..."
                  value={targetAddress}
                  onChange={e => setTargetAddress(e.target.value)}
                  error={addressError}
                />
              </div>

              {action === "remove" && isValidAddress && isAlreadyOwner && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-300/80 text-xs">Removing this owner requires majority confirmation from remaining owners.</p>
                </div>
              )}

              <Button
                onClick={handlePropose}
                disabled={!canPropose || (action === "remove" && wallet.owners.length <= 2)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-40"
              >
                {action === "add" ? <UserPlus className="h-4 w-4 mr-2" /> : <UserMinus className="h-4 w-4 mr-2" />}
                Submit Proposal
              </Button>
              <p className="text-gray-600 text-xs text-center">Requires {wallet.threshold} of {wallet.owners.length} confirmations to execute</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Proposals tab ───────────────────────────────────────────────────── */}
      {tab === "proposals" && (
        <div className="space-y-4">
          {loadingProposals ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading proposals…</p>
            </div>
          ) : proposals.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Users className="h-10 w-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-medium mb-1">No proposals yet</p>
              <p className="text-gray-600 text-sm">Switch to the Owners tab to propose adding or removing an owner.</p>
            </GlassCard>
          ) : (
            <>
              {pendingProposals.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Pending</p>
                  <div className="space-y-3">
                    {pendingProposals.map(p => {
                      const isExpired = p.expiry < now;
                      const hasConfirmed = p.hasConfirmed;
                      const hasRejected = p.hasRejected;
                      const canVote = !hasConfirmed && !hasRejected && !isExpired;
                      const status = proposalStatus(p);
                      // If the proposed address is NOT currently an owner → it's an Add proposal
                      // If it IS currently an owner → it's a Remove proposal
                      const isAdd = !wallet.owners.map(o => o.toLowerCase()).includes(p.proposedOwner.toLowerCase());

                      return (
                        <GlassCard key={p.index} className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                isAdd ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
                              }`}>
                                {isAdd ? <UserPlus className="h-4 w-4 text-green-400" /> : <UserMinus className="h-4 w-4 text-red-400" />}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{isAdd ? "Add Owner" : "Remove Owner"}</p>
                                <p className="text-gray-500 font-mono text-xs">{p.proposedOwner}</p>
                              </div>
                            </div>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                          </div>

                          {/* Vote progress */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 rounded-lg bg-green-500/[0.06] border border-green-500/15">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-green-400 text-xs">Confirmations</span>
                                <span className="text-white text-xs font-mono">{p.confirmations} / {wallet.threshold}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, (p.confirmations / wallet.threshold) * 100)}%` }} />
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/[0.06] border border-red-500/15">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-red-400 text-xs">Rejections</span>
                                <span className="text-white text-xs font-mono">{p.rejections} / {wallet.threshold}</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${Math.min(100, (p.rejections / wallet.threshold) * 100)}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {new Date(p.expiry * 1000).toLocaleDateString()}
                            </span>
                            <span>Proposal #{p.index}</span>
                          </div>

                          {/* My vote badge */}
                          {hasConfirmed && (
                            <div className="flex items-center gap-1.5 text-xs text-green-400 mb-3">
                              <CheckCircle className="h-3.5 w-3.5" /> You confirmed this proposal
                            </div>
                          )}
                          {hasRejected && (
                            <div className="flex items-center gap-1.5 text-xs text-red-400 mb-3">
                              <XCircle className="h-3.5 w-3.5" /> You rejected this proposal
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            {canVote && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmProposal(p)}
                                  className="flex-1 bg-green-600/80 hover:bg-green-600 text-white text-xs"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectProposal(p)}
                                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                                </Button>
                              </>
                            )}
                            {isExpired && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkExpired(p)}
                                className="flex-1 text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                              >
                                <Clock className="h-3.5 w-3.5 mr-1.5" /> Mark Expired
                              </Button>
                            )}
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}

              {pastProposals.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3 mt-6">History</p>
                  <div className="space-y-2">
                    {pastProposals.map(p => {
                      const status = proposalStatus(p);
                      return (
                        <div key={p.index} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                              {p.executed ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                            </div>
                            <div>
                              <p className="text-gray-300 text-xs font-mono">{p.proposedOwner}</p>
                              <p className="text-gray-600 text-[11px]">Proposal #{p.index} · {new Date(p.createdAt * 1000).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSuccess={loadProposals}
        title={modalState.title}
        description={modalState.description}
        onConfirm={modalState.onConfirm || (() => Promise.resolve())}
        estimatedGas={modalState.estimatedGas}
        networkFee={modalState.networkFee}
        details={modalState.details}
        warningMessage={modalState.warningMessage}
      />
    </div>
  );
}
