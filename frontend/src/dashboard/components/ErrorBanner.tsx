import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, RefreshCcw, HelpCircle, Clock } from 'lucide-react';

export type ErrorType = 'NO_WORKERS' | 'TIMEOUT' | 'INVALID_INPUT' | 'INSUFFICIENT_FUNDS';

interface ErrorBannerProps {
  type: ErrorType;
  onRetry?: () => void;
  onClose?: () => void;
}

const ERROR_CONFIG = {
  NO_WORKERS: {
    title: "No TEE Workers Available",
    description: "The decentralized network is currently busy or rebalancing. No workers picked up your confidential task.",
    action: "Wait 2-3 minutes and try again.",
    icon: AlertTriangle,
    color: "text-amber-500",
    borderColor: "border-amber-500/20",
    bg: "bg-amber-950/10"
  },
  TIMEOUT: {
    title: "Computation Timeout",
    description: "The secure enclave did not return a result within the allowed 5-minute window.",
    action: "Check your dataset size. Large files may require splitting.",
    icon: Clock, 
    color: "text-red-400",
    borderColor: "border-red-500/20",
    bg: "bg-red-950/10"
  },
  INVALID_INPUT: {
    title: "Invalid Input Format",
    description: "The upload does not match the expected schema for this algorithm.",
    action: "Download the sample dataset to verify your column headers.",
    icon: XCircle,
    color: "text-red-400",
    borderColor: "border-red-500/20",
    bg: "bg-red-950/10"
  },
  INSUFFICIENT_FUNDS: {
    title: "Insufficient Gas/Refills",
    description: "You do not have enough testnet credits to pay for this computation.",
    action: "Complete the 'Connect Discord' quest to earn more refills.",
    icon: AlertTriangle,
    color: "text-yellow-500",
    borderColor: "border-yellow-500/20",
    bg: "bg-yellow-950/10"
  }
};


const ErrorBanner: React.FC<ErrorBannerProps> = ({ type, onRetry, onClose }) => {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative rounded-xl border ${config.borderColor} ${config.bg} p-4 flex gap-4 overflow-hidden`}
    >
      <div className={`mt-0.5 shrink-0 ${config.color}`}>
         <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${config.color} mb-1`}>{config.title}</h4>
        <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
            {config.description}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-black/20 px-2 py-1.5 rounded w-fit">
            <HelpCircle className="h-3 w-3" />
            <span>Try: {config.action}</span>
        </div>
      </div>

      {onRetry && (
         <button 
           onClick={onRetry}
           className="self-start text-zinc-500 transition-colors"
         >
           <RefreshCcw className="h-4 w-4" />
         </button>
      )}
    </motion.div>
  );
};

export default ErrorBanner;
