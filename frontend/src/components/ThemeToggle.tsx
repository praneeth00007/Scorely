import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-10 h-10" />;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative w-14 h-8 bg-[var(--surface-highlight)] border border-[var(--border)] rounded-full p-1 flex items-center transition-colors duration-500 overflow-hidden shadow-inner"
            aria-label="Toggle Theme"
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="z-10 w-6 h-6 bg-white dark:bg-[var(--accent)] rounded-full shadow-lg flex items-center justify-center text-[var(--background)]"
                style={{ x: theme === 'dark' ? 24 : 0 }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Moon size={14} fill="currentColor" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sun size={14} fill="currentColor" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
