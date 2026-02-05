import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../Logo.png";

export const Header = ({ login, isConnected }: { login: () => void; isConnected: boolean }) => {
    const location = useLocation();

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-8 left-0 right-0 z-[200] px-6 pointer-events-none"
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-[var(--surface)] backdrop-blur-2xl border border-[var(--border)] rounded-3xl p-4 shadow-2xl pointer-events-auto">
                <Link to="/" className="flex items-center gap-1 pl-4 pointer-events-auto">
                    <div className="h-16 w-auto flex items-center justify-center overflow-hidden px-2">
                        <img src={Logo} alt="Logo" className="h-full w-auto object-contain" />
                    </div>
                </Link>

                {/* Navigation - Only show when connected */}
                {isConnected && (
                    <nav className="hidden md:flex items-center gap-10">
                        <Link to="/" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>Vision</Link>
                        <Link to="/profile" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/profile' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>Profile</Link>
                        <Link to="/dashboard" className={`text-xs font-black uppercase tracking-widest transition-colors ${location.pathname === '/dashboard' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>Dashboard</Link>
                    </nav>
                )}

                <div className="flex items-center gap-6 pr-4">
                    {isConnected ? (
                        <Link to="/dashboard">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="relative px-10 py-4 bg-[var(--text-main)] text-[var(--background)] text-sm font-black uppercase tracking-widest rounded-2xl overflow-hidden shadow-sm"
                            >
                                <span className="relative z-10">
                                    Dashboard
                                </span>
                            </motion.button>
                        </Link>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={login}
                            className="relative px-10 py-4 bg-[var(--accent)] text-white text-sm font-black uppercase tracking-widest rounded-2xl overflow-hidden shadow-xl"
                        >
                            <span className="relative z-10">
                                Connect Wallet
                            </span>
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};
