import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export const Header = ({ login, isConnected }: { login: () => void; isConnected: boolean }) => {
    const location = useLocation();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-8 left-0 right-0 z-[200] px-6 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-[var(--surface)] backdrop-blur-2xl border border-[var(--border)] rounded-3xl p-4 shadow-2xl pointer-events-auto">
                <Link to="/" className="flex items-center gap-4 pl-4 pointer-events-auto">
                    <div className="w-12 h-12 bg-[var(--text-main)] rounded-xl flex items-center justify-center shadow-lg">
                        <span className="font-display font-black text-[var(--background)] text-2xl -tracking-widest">SC</span>
                    </div>
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="font-display font-black text-3xl tracking-tighter text-[var(--text-main)] uppercase italic">SCORA</span>
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.4em] uppercase mt-1">Confidential</span>
                    </div>
                </Link>

                {/* Navigation - Only show when connected */}
                {isConnected && (
                    <nav className="hidden md:flex items-center gap-10">
                        <Link to="/" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`}>Vision</Link>
                        <Link to="/profile" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/profile' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`}>Profile</Link>
                        <Link to="/dashboard" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/dashboard' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'}`}>Dashboard</Link>
                    </nav>
                )}

                <div className="flex items-center gap-6 pr-4">
                    <ThemeToggle />
                    {isConnected ? (
                        <Link to="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative px-10 py-4 bg-[var(--text-main)] text-[var(--background)] text-sm font-black uppercase tracking-widest rounded-2xl overflow-hidden shadow-sm"
                            >
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                    Dashboard
                                </span>
                                <div className="absolute inset-0 bg-[var(--accent)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </motion.button>
                        </Link>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={login}
                            className="group relative px-10 py-4 bg-[var(--accent)] text-white text-sm font-black uppercase tracking-widest rounded-2xl overflow-hidden shadow-xl"
                        >
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                Connect Wallet
                            </span>
                            <div className="absolute inset-0 bg-[var(--text-main)] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};
