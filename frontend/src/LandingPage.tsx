import React, { Suspense, lazy } from "react";
import { useAccount, useChainEnforcement } from "./hooks/useWeb3Compat";
import { Noise } from "./landing/LandingUtils";
import { Header } from "./landing/Header";
import { Hero } from "./landing/HeroSection";
import { useConnectWallet } from '@web3-onboard/react';
import { Navigate } from "react-router-dom";

// Dynamic imports for below-the-fold content to optimize initial bundle size
const Features = lazy(() => import("./landing/SecondarySections").then(m => ({ default: m.Features })));
const Testimonials = lazy(() => import("./landing/SecondarySections").then(m => ({ default: m.Testimonials })));
const RealityBreak = lazy(() => import("./landing/RealityBreak").then(m => ({ default: m.RealityBreak })));
const Footer = lazy(() => import("./landing/SecondarySections").then(m => ({ default: m.Footer })));

// Removed DashboardLayout and DashboardSkeleton as they are no longer used here

const LandingPage = () => {
  const { isConnected } = useAccount();
  const [{ }, connect] = useConnectWallet();
  const { enforceArbitrumSepolia } = useChainEnforcement();

  const handleLogin = async () => {
    if (!isConnected) {
      try {
        const wallets = await connect();
        // Force chain switch immediately after connection
        if (wallets && wallets.length > 0) {
          console.log("Wallet connected, enforcing chain...");
          await enforceArbitrumSepolia();
        }
      } catch (error) {
        console.error("Connection failed:", error);
      }
    }
  };

  if (isConnected) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] selection:bg-[var(--accent)] selection:text-white">
      <Noise />

      {/* Critical Path: Header and Hero are loaded immediately */}
      <Header login={handleLogin} isConnected={isConnected} />

      <main>
        <Hero login={handleLogin} />

        {/* Deferred Path: These components load as the user scrolls or after initial paint */}
        <Suspense fallback={<div className="h-96" />}>
          <Features />
          <RealityBreak login={handleLogin} />
          <Testimonials />
          <Footer />
        </Suspense>
      </main>
    </div>
  );
};

export default LandingPage;
