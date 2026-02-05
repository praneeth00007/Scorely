import React from 'react';
import { Shield } from 'lucide-react';
import { useAccount } from '../../hooks/useWeb3Compat';

const Profile = () => {
    const { address } = useAccount();
    const [history, setHistory] = React.useState<any[]>([]);
    const [latestScore, setLatestScore] = React.useState<number | null>(null);

    React.useEffect(() => {
        const stored = localStorage.getItem('reputation_history');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Sort by timestamp desc (assuming newer added to front, but safety first)
                setHistory(parsed);
                if (parsed.length > 0) {
                    setLatestScore(parsed[0].score);
                }
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    return (
        <div className="text-slate-300 font-sans selection:bg-blue-500/30">
            {/* Header removed - managed by AppShell */}

            <div className="max-w-4xl mx-auto pb-24">

                {/* SECTION A: PROFILE HEADER (Identity) */}
                <header className="mb-16">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-4">User Profile</h1>
                    <div className="flex items-center gap-4">
                        <code className="font-mono text-sm text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded select-all cursor-text transition-colors">
                            {address || '0x0000...0000'}
                        </code>

                        {address && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                                <Shield size={12} /> Verified Wallet
                            </div>
                        )}
                    </div>
                </header>

                {/* SECTION B: TRUST & REPUTATION SUMMARY */}
                <section className="mb-16">
                    <div className="border border-slate-800 bg-slate-900/20 rounded-lg p-8 max-w-xl">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8">Trust Level</h2>

                        <div className="space-y-1 mb-6">
                            <div className="text-4xl font-bold text-white tracking-tight">
                                Current Score: {latestScore !== null ? latestScore : '---'}
                            </div>
                            <div className="text-lg text-slate-400 font-medium">
                                {latestScore !== null ? (latestScore > 750 ? 'Tier 1 — Elite' : latestScore > 650 ? 'Tier 2 — Scout' : 'Tier 3 — Cadet') : 'No Score Yet'}
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 border-t border-slate-800/50 pt-6 font-medium">
                            Derived from historical confidential executions and on-chain attestations.
                        </p>
                    </div>
                </section>

                {/* SECTION C: REPUTATION METRICS */}
                <section className="mb-16">
                    <div className="grid grid-cols-3 gap-8 border-t border-b border-slate-800 py-8">
                        <div>
                            <div className="text-2xl font-bold text-white tracking-tight">{history.length}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">TEE Proofs Generated</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white tracking-tight">
                                {(() => {
                                    const validScores = history.filter(h => h.score && h.score > 0).map(h => h.score);
                                    if (validScores.length === 0) return '---';
                                    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
                                    return Math.round(avg).toLocaleString();
                                })()}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reputation Score (Avg)</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white tracking-tight">{history.length}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Confidential Tasks</div>
                        </div>
                    </div>
                </section>

                {/* SECTION D: CONFIDENTIAL ACTIVITY HISTORY */}
                <section>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-6">Confidential Activity</h3>
                    <div className="overflow-hidden border border-slate-800 rounded-lg bg-slate-900/20">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-normal">Activity / Task ID</th>
                                    <th className="px-6 py-4 font-normal">Date</th>
                                    <th className="px-6 py-4 font-normal">Action</th>
                                    <th className="px-6 py-4 font-normal">Proof</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                                            No confidential activity recorded yet. Run a credit score calculation to see it here.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item, index) => (
                                        <tr key={index} className="transition-colors">
                                            <td className="px-6 py-4 text-slate-300 font-mono">
                                                <a
                                                    href={`https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${item.taskId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400"
                                                >
                                                    {item.taskId.slice(0, 10)}...{item.taskId.slice(-5)}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{item.timestamp}</td>
                                            <td className="px-6 py-4 text-slate-400">Score Generated</td>
                                            <td className="px-6 py-4 text-emerald-500 flex items-center gap-2">
                                                <Shield size={12} /> Verified
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Profile;
