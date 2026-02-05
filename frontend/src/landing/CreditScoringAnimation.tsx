import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Network, FileText, Users, Cpu, Check } from "lucide-react";

export const CreditScoringAnimation = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                setStep(0);
                await new Promise(r => setTimeout(r, 4000));
                setStep(1);
                await new Promise(r => setTimeout(r, 4000));
                setStep(2);
                await new Promise(r => setTimeout(r, 4000));
            }
        };
        sequence();
    }, []);

    return (
        <div className="relative h-[500px] w-full flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">

                {/* DATA SOURCES */}
                <AnimatePresence>
                    {step === 0 && (
                        <motion.div
                            key="sources"
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                            className="absolute inset-0 flex items-center justify-center gap-10"
                        >
                            <div className="grid grid-cols-2 gap-6 scale-90 md:scale-100">
                                {[
                                    { icon: Globe, label: "Bank Activity", color: "text-emerald-400" },
                                    { icon: Network, label: "DeFi Protocol", color: "text-purple-400" },
                                    { icon: FileText, label: "Asset Verify", color: "text-blue-400" },
                                    { icon: Users, label: "Identity Hash", color: "text-zinc-400" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl w-44 flex flex-col items-center gap-4 text-center shadow-2xl"
                                    >
                                        <div className={`p-3 bg-zinc-900 rounded-xl ${item.color}`}>
                                            <item.icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">{item.label}</span>
                                        <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-zinc-500 font-mono">ENCRYPTED</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PROCESSING ENGINE */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.div
                            key="engine"
                            initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                            className="relative z-20 flex flex-col items-center"
                        >
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[1px] border-dashed border-purple-500/30 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-4 border-[1px] border-dashed border-emerald-500/20 rounded-full"
                                />

                                <div className="w-48 h-48 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 shadow-[0_0_80px_rgba(168,85,247,0.15)]">
                                    <Cpu className="h-12 w-12 text-purple-500 mb-6 animate-pulse" />
                                    <div className="text-[10px] font-mono text-center space-y-2">
                                        <p className="text-zinc-400 tracking-tighter">INITIATING TEE ENCLAVE...</p>
                                        <p className="text-white font-bold tracking-widest">SGX_ACTIVE</p>
                                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-4">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 4, ease: "easeInOut" }}
                                                className="h-full bg-purple-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* RESULT */}
                <AnimatePresence>
                    {step === 2 && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, filter: "blur(15px)" }}
                            className="relative z-30"
                        >
                            <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl w-80 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="text-sm font-black text-zinc-500 tracking-[0.4em] uppercase mb-10">Generated Score</div>

                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="text-9xl font-display font-black tracking-tighter text-white mb-6 italic"
                                    >
                                        814
                                    </motion.div>

                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-widest mb-12 transition-transform">
                                        <Check size={16} strokeWidth={3} /> Verified Excellent
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-10">
                                        <div className="text-left">
                                            <div className="text-[10px] text-zinc-600 uppercase mb-2 font-black">Risk Profile</div>
                                            <div className="text-sm text-white font-bold tracking-widest">V_LOW</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-zinc-600 uppercase mb-2 font-black">PoCo Proof</div>
                                            <div className="text-sm text-purple-400 font-bold tracking-widest text-[#8b5cf6]">SIGNED</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
