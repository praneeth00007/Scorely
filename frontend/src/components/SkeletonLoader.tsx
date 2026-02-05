import React from 'react';
import { motion } from 'framer-motion';

export const LandingSkeleton = () => (
  <div className="min-h-screen bg-black text-white p-6 pt-40 flex flex-col items-center">
    <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-20">
      <div className="space-y-8 animate-pulse">
        <div className="h-24 bg-zinc-900 rounded-3xl w-3/4" />
        <div className="h-4 bg-zinc-900 rounded w-full" />
        <div className="h-4 bg-zinc-900 rounded w-2/3" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-32 bg-zinc-900 rounded-full" />
          <div className="h-12 w-32 bg-zinc-900 rounded-full" />
        </div>
      </div>
      <div className="h-96 bg-zinc-900/50 rounded-full animate-pulse blur-3xl opacity-20" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#0f1116] text-white flex">
    {/* Sidebar Skeleton matching AppShell */}
    <div className="w-64 border-r border-slate-800 p-6 space-y-8 hidden md:block bg-[#0f1116]">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-8 bg-blue-500/20 rounded-lg animate-pulse" />
        <div className="h-6 w-24 bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-full bg-slate-800/40 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="flex-1 p-8 space-y-8 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded-md animate-pulse" />
          <div className="h-4 w-64 bg-slate-800/50 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded-full animate-pulse" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-40 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse" />
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <div className="h-96 bg-slate-900/40 border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);
