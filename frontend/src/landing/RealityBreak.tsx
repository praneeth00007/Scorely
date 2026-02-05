import React from "react";
import { motion } from "framer-motion";
import { Glow } from "./LandingUtils";

export const RealityBreak = ({ login }: { login: () => void }) => (
  <section className="py-60 px-6 relative flex flex-col items-center justify-center text-center bg-[var(--background)] overflow-hidden border-t border-[var(--border)]">
    <Glow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-purple-900/10 blur-[200px]" />

    <motion.h2
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="text-9xl md:text-[18rem] font-display font-black leading-none tracking-tighter text-[var(--surface-highlight)] uppercase italic select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
    >
      ORACLE
    </motion.h2>

    <div className="relative z-10">
      <h3 className="text-4xl md:text-6xl font-display font-black text-[var(--text-main)] mb-12 uppercase tracking-tighter">
        READY TO MINT <br /> YOUR REPUTATION?
      </h3>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={login}
        className="px-16 py-7 bg-[var(--text-main)] text-[var(--background)] font-display font-black uppercase text-xl tracking-[0.2em] italic transition-all duration-500 shadow-2xl"
      >
        Initialize Engine
      </motion.button>
    </div>
  </section>
);
