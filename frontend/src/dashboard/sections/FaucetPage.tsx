import React from 'react';
import {
    Droplets,
    ArrowLeftRight,
    ExternalLink,
    Coins,
    Clock,
    ShieldCheck,
    Zap,
    HelpCircle
} from 'lucide-react';

const FaucetPage = () => {
    const categories = [
        {
            title: "Network Gas (Arbitrum Sepolia ETH)",
            description: "Choose one of these paths to get gas for transactions on Arbitrum Sepolia.",
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            links: [
                {
                    name: "Path 1: Alchemy Arbitrum Faucet",
                    url: "https://www.alchemy.com/faucets/arbitrum-sepolia",
                    info: "Quickest method. Requires 0.01 ETH balance on Ethereum Mainnet."
                },
                {
                    name: "Path 2: Google Cloud Sepolia (24h Claim)",
                    url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
                    info: "Claim L1 Sepolia ETH once every 24 hours. MUST BRIDGE to Arbitrum Sepolia (10-15 min wait)."
                },
                {
                    name: "Path 3: Rari Testnet (Unlimited)",
                    url: "https://rari-testnet.hub.caldera.xyz/",
                    info: "Unlimited claims available. MUST BRIDGE to Arbitrum Sepolia (Approx. 1 hour wait)."
                }
            ]
        },
        {
            title: "Bridging Tools",
            description: "Required for Path 2 and Path 3 to move funds to Arbitrum Sepolia.",
            icon: ArrowLeftRight,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            links: [
                {
                    name: "Official Arbitrum Bridge (For Path 2)",
                    url: "https://portal.arbitrum.io/bridge?amount=0&destinationChain=arbitrum-sepolia&sanitized=true&sourceChain=sepolia&tab=bridge",
                    info: "Bridge your L1 Sepolia ETH. Takes 10-15 minutes."
                },
                {
                    name: "Rari Bridge (For Path 3)",
                    url: "https://rari-testnet.bridge.caldera.xyz/",
                    info: "Bridge unlimited funds. Takes 1 hour due to withdrawal periods."
                }
            ]
        },
        {
            title: "Computation Fuel (RLC)",
            description: "Required to pay for secure enclave (TEE) execution on Arbitrum Sepolia.",
            icon: Coins,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            links: [
                {
                    name: "iExec RLC Faucet",
                    url: "https://explorer.iex.ec/arbitrum-sepolia-testnet/account",
                    info: "Claim testnet RLC directly on Arbitrum Sepolia Testnet."
                }
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto font-sans text-slate-300 pb-20">
            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                        <Droplets className="text-[var(--accent)] h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Arbitrum Sepolia Faucet Hub</h1>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl font-medium">
                    To execute confidential computations on the <span className="text-blue-400">Arbitrum Sepolia Testnet</span>, you'll need testnet ETH for gas and RLC for computation fuel.
                </p>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Information Sections */}
                <div className="space-y-8">
                    {categories.map((cat, idx) => (
                        <div key={idx} className={`p-8 rounded-2xl border ${cat.border} ${cat.bg} backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-black/20`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl bg-white/5`}>
                                    <cat.icon className={`${cat.color} h-6 w-6`} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white uppercase tracking-wider text-[13px]">{cat.title}</h2>
                                    <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {cat.links.map((link, lIdx) => (
                                    <a
                                        key={lIdx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-[var(--accent)] transition-colors">
                                                {link.name}
                                            </span>
                                            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-[var(--accent)]" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                            {link.info}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Guide Sidebar */}
                <div className="space-y-8">
                    <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-highlight)]/30">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="text-[var(--accent)] h-5 w-5" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Quick Guide</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200 mb-1">Choose your Gas Path</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Use <span className="text-white">Path 1</span> if you have Mainnet ETH.
                                        Use <span className="text-white">Path 2</span> or <span className="text-white">Path 3</span> if you need free testnet funds, then bridge them.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200 mb-1">Get RLC for Computation</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Visit the iExec Explorer to claim testnet RLC. This is specifically required for enclave execution on <span className="text-white">Arbitrum Sepolia</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-6 w-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200 mb-1">Wait for Bridging</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Bridging from L1 Sepolia took <span className="text-emerald-500">10-15 minutes</span>.
                                        Bridging from Rari is unlimited but takes <span className="text-amber-500">1 hour</span>.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3">
                            <ShieldCheck className="text-emerald-500 h-5 w-5 shrink-0" />
                            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
                                Once funded, your account is ready for confidential execution using hardware-level security.
                            </p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden p-8 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/10 to-transparent">
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Network Specs</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[11px] text-slate-500">Chain ID</span>
                                    <span className="text-[11px] font-mono text-slate-200">421614</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[11px] text-slate-500">Currency</span>
                                    <span className="text-[11px] font-mono text-slate-200">ETH</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[11px] text-slate-500">Explorer</span>
                                    <a href="https://sepolia.arbiscan.io" target="_blank" rel="noreferrer" className="text-[11px] font-mono text-[var(--accent)] hover:underline">Arbiscan</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaucetPage;
