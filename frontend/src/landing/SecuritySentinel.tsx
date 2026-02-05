import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Cpu, Zap, EyeOff, CheckCircle } from "lucide-react";

export const SecuritySentinel = () => {
    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-[var(--surface-highlight)] rounded-[3rem] border border-[var(--border)] shadow-inner">
            {/* Background Grid/Matrix effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `radial-gradient(var(--accent) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
            />

            {/* Central Hologram Shield */}
            <div className="relative z-20">
                {/* Outer Glow Rings */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[var(--accent)] rounded-full blur-[60px] -z-10"
                />

                <div className="relative">
                    <div className="p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--accent)]/30 shadow-[0_0_50px_rgba(var(--accent-rgb),0.2)]">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Shield size={80} className="text-[var(--accent)] drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" strokeWidth={1.5} />
                        </motion.div>
                    </div>
                </div>

                {/* Orbiting Security Labels */}
                {[
                    { icon: Lock, label: "ENCRYPTED", pos: "top-[-40px] left-1/2 -translate-x-1/2" },
                    { icon: Cpu, label: "TEE_SECURE", pos: "bottom-[-40px] left-1/2 -translate-x-1/2" },
                    { icon: Zap, label: "ATTESTED", pos: "left-[-80px] top-1/2 -translate-y-1/2" },
                    { icon: CheckCircle, label: "VERIFIED", pos: "right-[-80px] top-1/2 -translate-y-1/2" }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className={`absolute ${item.pos} bg-[var(--surface)] px-4 py-2 border border-[var(--border)] rounded-full flex items-center gap-2 shadow-xl whitespace-nowrap`}
                    >
                        <item.icon size={12} className="text-[var(--accent)]" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-main)]">{item.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Floating Data Particles being "Cleaned/Secured" */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -100, y: Math.random() * 400, opacity: 0 }}
                        animate={{
                            x: [null, 600],
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 1, 0.5]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 1,
                            ease: "linear"
                        }}
                        className="absolute flex items-center gap-2 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[6px] font-mono text-zinc-500">RAW_DATA_CHUNK_{i}</span>
                        {/* Encryption Transition Point (approx middle) */}
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
                            className="absolute inset-0 bg-emerald-500/20 backdrop-blur-xl flex items-center justify-center rounded-xl"
                        >
                            <Lock size={10} className="text-emerald-500" />
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Security Warning Message */}
            <div className="absolute bottom-8 left-0 right-0 text-center px-10">
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl"
                >
                    <EyeOff size={14} className="text-red-500" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">
                        Never share your private keys or seed phrase
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
