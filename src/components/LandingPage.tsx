import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ShieldCheck,
  ArrowRight,
  Clock,
  Wallet,
  Code2,
  Github as GithubIcon,
  FileCode2,
  RefreshCcw,
  KeyRound,
  Fingerprint,
} from 'lucide-react';
import { Button } from './ui/Button';

// ─── Mini mock wallet card shown in hero ─────────────────────────────────────
function MockWalletCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-3xl" />

      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl">
        {/* Card header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="SafeTea" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className="text-white text-sm font-medium font-display">Team Treasury</p>
                <p className="text-gray-500 text-xs font-mono">0x4f3a…c91b</p>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
              Active
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-display font-light text-white">12.48</span>
            <span className="text-gray-400 mb-1">ETH</span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">≈ $31,200.00</p>
        </div>

        {/* Pending tx */}
        <div className="px-5 py-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Pending</p>
          {[
            { to: '0xa1b2…3c4d', amount: '2.5 ETH', confirms: '1/2' },
            { to: '0xde9f…7e2a', amount: '500 USDC', confirms: '0/2' },
          ].map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">Send {tx.amount}</p>
                  <p className="text-gray-500 text-xs font-mono">{tx.to}</p>
                </div>
              </div>
              <span className="text-xs text-yellow-400 font-mono">{tx.confirms}</span>
            </div>
          ))}
        </div>

        {/* Owners row */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <div className="flex -space-x-2">
              {['bg-purple-500', 'bg-blue-500', 'bg-teal-500'].map((c, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${c} border-2 border-gray-950 flex items-center justify-center`}
                >
                  <span className="text-white text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <span className="text-gray-400 text-xs">3 owners · 2/3 threshold</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Background grid + blobs ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(147,51,234,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-700/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 overflow-hidden">
            <img src="/logo.png" alt="SafeTea" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-white font-display font-medium text-lg tracking-tight">
            Safe<span className="text-purple-400">Tea</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <Button
              onClick={() => navigate('/wallets')}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              Open App
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left: copy */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-semibold text-white leading-[1.05] tracking-tight mb-5 sm:mb-6">
              Secure assets,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                together.
              </span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-lg">
              SafeTea is a non-custodial multi-sig wallet built for teams, DAOs, and
              organizations. Every transaction requires consensus — no single point of failure.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-10">
              {isConnected ? (
                <Button
                  onClick={() => navigate('/wallets')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-xl shadow-purple-500/20"
                >
                  Open App
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium text-base shadow-xl shadow-purple-500/20 transition-all"
                    >
                      Launch App
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </ConnectButton.Custom>
              )}

              <a
                href="https://github.com/SafeTeaWallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/5 text-base font-medium transition-all"
              >
                View on GitHub
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: mock wallet — visible on lg+, also shown below hero on mobile */}
          <div className="block lg:hidden mt-4">
            <MockWalletCard />
          </div>
          <div className="hidden lg:block">
            <MockWalletCard />
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.07] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: Code2,      value: 'Solidity',   label: 'Smart Contracts' },
              { icon: ShieldCheck, value: 'Foundry',   label: 'Tested & Verified' },
              { icon: Wallet,     value: 'Wagmi',      label: 'Wallet Integration' },
              { icon: GithubIcon,  value: 'Open Source', label: 'MIT Licensed' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <s.icon className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xl font-display font-semibold text-white mb-1">{s.value}</p>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-16">
          <p className="text-purple-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Why SafeTea
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-white leading-tight max-w-lg">
              What makes it different
            </h2>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Purpose-built from scratch. No forks, no wrappers — just clean on-chain logic.
            </p>
          </div>
        </div>

        {/* Top row: 3 wide cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden mb-px">
          {[
            {
              num: '01',
              icon: FileCode2,
              title: 'Fully Verifiable On-Chain',
              desc: 'Every action — deploy, propose, confirm, execute — is a raw on-chain transaction. No off-chain relayers, no meta-transactions, no hidden state.',
              color: 'text-purple-400',
            },
            {
              num: '02',
              icon: RefreshCcw,
              title: 'Threshold Changes Without Migration',
              desc: 'Adjust your signing threshold or swap owners without redeploying. The wallet evolves with your team through governance proposals, not contract upgrades.',
              color: 'text-blue-400',
            },
            {
              num: '03',
              icon: Clock,
              title: 'Auto-Expiring Transactions',
              desc: 'Stale proposals self-invalidate after 30 days. No manual cleanup, no zombie transactions sitting in queue — the contract enforces hygiene automatically.',
              color: 'text-teal-400',
            },
          ].map((f) => (
            <div
              key={f.num}
              className="group relative bg-[#0a0a0f] p-8 hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-[11px] font-mono text-white/20 tracking-widest">{f.num}</span>
                <f.icon className={`w-5 h-5 ${f.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className="text-white font-display font-medium text-lg mb-3 leading-snug">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom row: 2 wide cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          {[
            {
              num: '04',
              icon: KeyRound,
              title: 'No Privileged Deployer',
              desc: 'Once deployed, the factory has zero control over your wallet. There is no owner key, no pause function, no backdoor. The contract is immutable and ownerless by design.',
              color: 'text-orange-400',
            },
            {
              num: '05',
              icon: Fingerprint,
              title: 'Proposal-Based Owner Management',
              desc: 'Adding or removing a signer is itself a multi-sig transaction. No single owner can unilaterally change the team — every structural change requires the same consensus as a fund transfer.',
              color: 'text-green-400',
            },
          ].map((f) => (
            <div
              key={f.num}
              className="group relative bg-[#0a0a0f] p-8 hover:bg-white/[0.02] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-[11px] font-mono text-white/20 tracking-widest">{f.num}</span>
                <f.icon className={`w-5 h-5 ${f.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className="text-white font-display font-medium text-lg mb-3 leading-snug">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

          {/* Header */}
          <div className="mb-20">
            <p className="text-purple-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              How it works
            </p>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-white leading-tight max-w-md">
                From deploy to execution
              </h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Three on-chain steps. No backend, no custody, no trust required.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">

            {/* Step 1 */}
            <div className="group bg-[#0a0a0f] p-8 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[11px] font-mono text-white/20 tracking-widest">01 / 03</span>
                <span className="text-[11px] font-mono text-purple-400/60 tracking-widest">DEPLOY</span>
              </div>

              <h3 className="text-white font-display font-medium text-xl mb-3">Deploy your Safe</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Call the factory contract with your owners list. A new wallet contract is deployed on-chain — owned by no one except its signers.
              </p>

              {/* Mini visual: owner list */}
              <div className="rounded-xl border border-white/[0.07] bg-black/40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500/60" />
                  <span className="text-[11px] font-mono text-white/30">createWallet(owners[])</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {['0x4f3a…c91b', '0xa1b2…3c4d', '0xde9f…7e2a'].map((addr, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${['bg-purple-600', 'bg-blue-600', 'bg-teal-600'][i]}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">{addr}</span>
                      <span className="ml-auto text-[10px] text-white/20">owner</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/20">threshold</span>
                  <span className="text-[11px] font-mono text-purple-400">2 / 3</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group bg-[#0a0a0f] p-8 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[11px] font-mono text-white/20 tracking-widest">02 / 03</span>
                <span className="text-[11px] font-mono text-blue-400/60 tracking-widest">PROPOSE</span>
              </div>

              <h3 className="text-white font-display font-medium text-xl mb-3">Propose a transaction</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Any owner submits a transaction — ETH transfer, token send, or arbitrary calldata. It enters the queue with an expiry timestamp.
              </p>

              {/* Mini visual: pending tx */}
              <div className="rounded-xl border border-white/[0.07] bg-black/40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                  <span className="text-[11px] font-mono text-white/30">tx #4 · pending</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">to</span>
                    <span className="text-[11px] font-mono text-gray-400">0xa1b2…3c4d</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">value</span>
                    <span className="text-[11px] font-mono text-white">2.5 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">data</span>
                    <span className="text-[11px] font-mono text-gray-600">0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">expires</span>
                    <span className="text-[11px] font-mono text-orange-400/80">30d</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/20">confirmations</span>
                  <span className="text-[11px] font-mono text-yellow-400">1 / 2</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group bg-[#0a0a0f] p-8 hover:bg-white/[0.02] transition-colors duration-300">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[11px] font-mono text-white/20 tracking-widest">03 / 03</span>
                <span className="text-[11px] font-mono text-teal-400/60 tracking-widest">EXECUTE</span>
              </div>

              <h3 className="text-white font-display font-medium text-xl mb-3">Confirm & execute</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Once the majority threshold is reached, the transaction executes on-chain automatically. No extra call, no relayer — the contract handles it.
              </p>

              {/* Mini visual: execution receipt */}
              <div className="rounded-xl border border-white/[0.07] bg-black/40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse" />
                  <span className="text-[11px] font-mono text-white/30">tx #4 · executed</span>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">confirmations</span>
                    <span className="text-[11px] font-mono text-green-400">2 / 2 ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">block</span>
                    <span className="text-[11px] font-mono text-gray-400">#21,847,302</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">gas used</span>
                    <span className="text-[11px] font-mono text-gray-400">48,291</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-mono text-white/30">status</span>
                    <span className="text-[11px] font-mono text-green-400">success</span>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.05]">
                  <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/[0.07]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          {/* Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[200px] bg-purple-700/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative">
            <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-4">
              Get started
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white mb-5 leading-tight">
              Your team's treasury,{' '}
              <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                secured.
              </span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
              Connect your wallet and deploy a Safe in under two minutes. No sign-up, no custody, no compromise.
            </p>

            {isConnected ? (
              <Button
                onClick={() => navigate('/wallets')}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-2xl shadow-purple-500/25 px-10"
              >
                Open App
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="inline-flex items-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-display font-medium text-base shadow-2xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Connect Wallet
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            <p className="text-gray-600 text-sm mt-5">
              Open source · Non-custodial · Deployed on Ethereum
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="SafeTea" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-gray-500 text-sm font-display">
              Safe<span className="text-purple-500">Tea</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Built with Solidity, Foundry, React & Wagmi
          </p>
        </div>
      </footer>

    </div>
  );
}
