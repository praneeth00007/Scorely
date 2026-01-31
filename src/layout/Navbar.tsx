import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Cpu, ExternalLink, LogOut } from 'lucide-react';
import { useAccount, useDisconnect } from '../hooks/useWeb3Compat';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const navItems = [
        { path: '/dashboard', label: 'Score Engine', icon: Cpu },
    ];

    return (
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border)] flex flex-col bg-[var(--surface)] z-20 transition-colors fixed md:sticky top-0 h-[64px] md:h-screen">

            {/* Header Logo */}
            <Link to="/" className="p-4 md:p-8 border-b border-[var(--border)] flex items-center gap-4 hover:bg-[var(--surface-highlight)] transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--text-main)] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="font-display font-black text-[var(--background)] text-lg md:text-xl -tracking-widest">SC</span>
                </div>
                <div className="flex flex-col leading-none hidden md:flex">
                    <span className="font-display font-black text-2xl tracking-tighter uppercase italic text-[var(--text-main)]">SCORELY</span>
                    <span className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.3em] uppercase mt-1 italic">Labs</span>
                </div>
            </Link>

            {/* Navigation Links (Hidden on mobile for now - strict desktop focus per user context, or responsive stack) */}
            <nav className="flex-1 p-6 space-y-2 hidden md:block">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        id="nav-dashboard" /* Target for Tour */
                        className={({ isActive }) => `w-full flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-300 group font-bold uppercase text-[11px] tracking-[0.2em] relative overflow-hidden ${isActive
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-highlight)]'
                            }`}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`h-4 w-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'}`} strokeWidth={1.5} />
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-[-1px] top-4 bottom-4 w-1 bg-[var(--accent)] rounded-full"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                <NavLink
                    to="/profile"
                    id="nav-profile" /* Target for Tour */
                    className={({ isActive }) => `w-full flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-300 group font-bold uppercase text-[11px] tracking-[0.2em] border border-transparent ${isActive
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                        : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 hover:border-[var(--accent)]/10'
                        }`}
                >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                    <span className="relative z-10">Account Profile</span>
                </NavLink>
            </nav>

            {/* User / Logout (Desktop) */}
            <div className="p-6 border-t border-[var(--border)] hidden md:block mt-auto" id="nav-user">
                <div className="bg-[var(--surface-highlight)] border border-[var(--border)] p-5 rounded-2xl mb-6 flex items-center gap-5 group hover:border-[var(--accent)]/30 transition-colors">
                    <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                        {address?.slice(2, 4).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 min-w-0 font-bold">
                        <p className="text-[11px] font-black text-[var(--text-muted)] truncate tracking-tight uppercase group-hover:text-[var(--text-main)] transition-colors">
                            {address || '0x00...000'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
                            <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">SGX ACTIVE</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => disconnect()}
                    className="w-full flex items-center justify-center gap-4 text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-[var(--text-main)] py-3 transition-all group"
                >
                    <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                    <span className="tracking-[0.2em]">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
};

export default Navbar;
