import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "./LandingPage";
import AppShell from "./layout/AppShell";

// Lazy Load Dashboard Components
const CreditScoreTEE = lazy(() => import("./dashboard/sections/CreditScoreTEE"));
const FaucetPage = lazy(() => import("./dashboard/sections/FaucetPage"));
const Profile = lazy(() => import("./dashboard/sections/Profile"));
const ExecutionPage = lazy(() => import("./dashboard/sections/ExecutionPage"));

// Need to import useState/Effect if not already there, but useSessionRestore encapsulates it.
import { useAccount, useSessionRestore } from "./hooks/useWeb3Compat";

const ProtectedRoute = () => {
  const { isConnected } = useAccount(); // We can remove isConnecting here as App handles it globally
  return isConnected ? <AppShell /> : <Navigate to="/" replace />;
};

import { DashboardSkeleton, LandingSkeleton } from "./components/SkeletonLoader";

function App() {
  const { isRestoring } = useSessionRestore();

  if (isRestoring) {
    // Show appropriate skeleton based on entry point
    return window.location.pathname === '/' ? <LandingSkeleton /> : <DashboardSkeleton />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<DashboardSkeleton />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated Routes Wrapped in AppShell */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CreditScoreTEE />} />
            <Route path="/faucet" element={<FaucetPage />} />
            <Route path="/run/:runId" element={<ExecutionPage />} />
            <Route path="/profile" element={<Profile />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
