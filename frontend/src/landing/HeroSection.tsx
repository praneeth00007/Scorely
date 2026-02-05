import React from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Lock } from "lucide-react";
import { CreditScoringAnimation } from "./CreditScoringAnimation";
import { Glow } from "./LandingUtils";

export const Hero = ({ login }: { login: () => void }) => (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <Glow className="top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10" />
        <Glow className="bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "circOut" }}
                className="overflow-visible"
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-4 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-full mb-12 backdrop-blur-xl"
                >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#34d399]" />
                    <span className="text-[11px] font-black text-[var(--text-muted)] tracking-[0.5em] uppercase">Private Credit Intelligence v2.0</span>
                </motion.div>

                <h1 className="text-7xl md:text-9xl font-display font-black leading-[1.1] tracking-tight mb-12 text-[var(--text-main)] uppercase italic overflow-visible" style={{ paddingRight: '2rem' }}>
                    CREDIT <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] via-purple-600 to-indigo-800 inline-block" style={{ paddingRight: '6rem', marginRight: '-4rem' }}>WITHOUT EXPOSURE</span>
                </h1>

                <p className="text-lg text-[var(--text-muted)] max-w-lg mb-16 font-mono leading-relaxed border-l-2 border-[var(--border)] pl-8 italic">
                    Standardized credit assessments powered by secure TEE enclaves.
                    Your raw financial history never leaves your device unencrypted.
                </p>

                <div className="flex flex-wrap items-center gap-12 opacity-80">
                    <div className="flex items-center gap-4">
                        <Shield size={24} className="text-purple-500" />
                        <span className="text-xs font-black tracking-widest text-[var(--text-main)]">INTEL SGX</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Cpu size={24} className="text-emerald-500" />
                        <span className="text-xs font-black tracking-widest text-[var(--text-main)]">IEXEC TEE</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Lock size={24} className="text-blue-500" />
                        <span className="text-xs font-black tracking-widest text-[var(--text-main)]">ZK SECURE</span>
                    </div>
                </div>
            </motion.div>

            <div className="relative">
                <CreditScoringAnimation />
            </div>
        </div>
    </section>
);
