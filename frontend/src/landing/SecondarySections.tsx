import React from "react";
import { motion } from "framer-motion";
import { Lock, Zap, Server } from "lucide-react";
import Logo from "../Logo.png";

const FeatureCard = ({ icon: Icon, title, subtitle, steps, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="p-10 bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] transition-all duration-500 shadow-sm"
    >
        <div className="w-16 h-16 bg-[var(--surface-highlight)] rounded-3xl flex items-center justify-center mb-10 transition-all duration-500 border border-[var(--border)]">
            <Icon className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-3xl font-display font-black text-[var(--text-main)] mb-2 uppercase italic leading-none">{title}</h3>
        <p className="text-xs font-black text-[var(--accent)] tracking-[0.2em] uppercase mb-10">{subtitle}</p>

        <div className="space-y-6">
            {steps.map((step: string, i: number) => (
                <div key={i} className="flex gap-5 items-start text-[var(--text-muted)] transition-colors">
                    <span className="text-sm font-black text-[var(--border)] mt-0.5">0{i + 1}</span>
                    <p className="text-sm font-bold leading-relaxed">{step}</p>
                </div>
            ))}
        </div>
    </motion.div>
);

export const Features = () => (
    <section className="py-40 px-6 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
            <div className="mb-32 flex flex-col md:flex-row md:items-end md:justify-between gap-12">
                <div>
                    <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-[0.85] text-[var(--text-main)]">
                        CONFIDENTIAL <br />
                        <span className="text-[var(--border)]">PIPELINE</span>
                    </h2>
                </div>
                <p className="text-[var(--text-muted)] max-w-sm font-mono text-sm leading-relaxed">
                    The protocol combines decentralized trust with hardware-level security.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
                <FeatureCard
                    icon={Lock}
                    title="Data Armor"
                    subtitle="Privacy Layer"
                    delay={0.1}
                    steps={[
                        "AES-256 client-side encryption.",
                        "Off-chain data contribution via iExec.",
                        "Access control via Smart Contracts."
                    ]}
                />
                <FeatureCard
                    icon={Zap}
                    title="Score Mach"
                    subtitle="TEE Compute"
                    delay={0.2}
                    steps={[
                        "Processing in isolated hardware.",
                        "Deterministic scoring algorithms.",
                        "Immutable execution logs."
                    ]}
                />
                <FeatureCard
                    icon={Server}
                    title="Zero Trust"
                    subtitle="Attestation"
                    delay={0.3}
                    steps={[
                        "Crytographic Proof of Compute.",
                        "On-chain score verification.",
                        "Verifiable grade credential NFTs."
                    ]}
                />
            </div>
        </div>
    </section>
);

export const Testimonials = () => {
    const reviews = [
        { text: "This engine finally lets me use my bank data on-chain without exposing it.", author: "Alex D.", role: "DeFi User" },
        { text: "The TEE verification is a game changer for under-collateralized loans.", author: "Sarah K.", role: "Lending Protocol" },
        { text: "Smooth, fast, and completely private. The future of credit scoring.", author: "James M.", role: "Crypto Native" },
        { text: "I love that I own my data. No more black box scoring models.", author: "Elena R.", role: "Privacy Advocate" }
    ];

    return (
        <section className="py-32 border-t border-[var(--border)] overflow-hidden bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
                <h3 className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-4">Community Trust</h3>
                <h2 className="text-4xl md:text-6xl font-display font-black text-[var(--text-main)] italic uppercase">
                    Verified <span className="text-[var(--text-muted)]">Feedback</span>
                </h2>
            </div>

            <div className="relative flex overflow-hidden group">
                <div className="flex gap-8 animate-marquee whitespace-nowrap py-4">
                    {[...reviews, ...reviews, ...reviews].map((review, i) => (
                        <div key={i} className="w-[400px] p-8 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] flex-shrink-0 transition-colors">
                            <div className="flex gap-1 mb-6 text-[var(--accent)]">
                                {[...Array(5)].map((_, i) => <Zap key={i} size={14} fill="currentColor" />)}
                            </div>
                            <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed italic mb-8 whitespace-normal">"{review.text}"</p>
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">{review.author}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{review.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />
            </div>
        </section>
    );
};

export const Footer = () => (
    <footer className="py-20 px-6 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
                <div className="h-14 w-auto flex items-center justify-center overflow-hidden px-2">
                    <img src={Logo} alt="Logo" className="h-full w-auto object-contain" />
                </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3">
                <span className="font-bold text-[10px] text-[var(--text-muted)] tracking-[0.5em] uppercase">Designed for Privacy // Built on iExec</span>
                <span className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-widest">© 2026 Scorely Labs</span>
            </div>
        </div>
    </footer>
);
