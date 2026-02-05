import React from 'react';
import ReactJoyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import Mascot from '../../Mascot.png';

interface Props {
  run: boolean;
  steps?: Step[];
  onFinish: () => void;
}

import { TooltipRenderProps } from 'react-joyride';

import { useState, useEffect } from 'react';

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  const [isSkipping, setIsSkipping] = useState(false);

  /* Access standard step properties */
  const title = step.title;

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSkipping(true);
    setTimeout(() => {
      closeProps.onClick(e as any);
    }, 1500);
  };

  return (
    <div
      {...tooltipProps}
      className="bg-[#09090b] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl max-w-4xl flex flex-row items-stretch relative"
    >
      {/* Skip Button - positioned absolute top-left */}
      {!isLastStep && !isSkipping && (
        <button
          onClick={handleSkip}
          className="absolute top-6 left-8 z-20 text-[10px] font-black tracking-widest text-zinc-600 transition-colors uppercase"
        >
          Skip Tour
        </button>
      )}

      {/* Content Side (Left) */}
      <div className="flex-1 flex flex-col p-8 md:p-10 min-h-[320px] pt-16">
        {/* pt-16 to clear the Skip button */}

        {isSkipping ? (
          <div className="flex flex-col items-center justify-center flex-1 animate-fade-in text-center h-full">
            <h3 className="font-display font-black text-2xl text-[var(--accent)] mb-2 uppercase italic">Success!</h3>
            <p className="text-zinc-400 text-sm">Thank you for exploring the environment.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Fixed Height Content Area */}
            <div className="flex-1 mb-6">
              {title && (
                <h3 className="font-bold text-xl mb-4 uppercase tracking-tight text-white border-b border-white/10 pb-2 inline-block">
                  {title}
                </h3>
              )}
              <div className="h-32 overflow-y-auto"> {/* Scrollable if text is too long, but fixed height */}
                <div className="text-sm text-zinc-300 leading-relaxed font-medium">
                  {step.content}
                </div>
              </div>
            </div>

            {/* Navigation (Fixed at bottom right) */}
            <div className="flex justify-end items-center mt-auto pt-4 border-t border-white/5 h-16 shrink-0">
              <div className="flex gap-4 items-center">
                {index > 0 && (
                  <button {...backProps} className="text-[10px] font-black tracking-widest text-[var(--border)] transition-colors uppercase">
                    Prev
                  </button>
                )}
                <button
                  {...primaryProps}
                  className="bg-[var(--accent)] text-white text-xs font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                  {continuous ? (isLastStep ? 'FINISH' : 'NEXT STEP') : 'CLOSE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mascot Side (Right) */}
      <div className="w-72 bg-gradient-to-br from-blue-900/10 to-[#09090b] relative border-l border-white/5 flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="relative w-80 h-80 -mr-10 items-center flex">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
          <img
            src={Mascot}
            alt="Mascot"
            className="relative w-full h-full object-contain drop-shadow-2xl grayscale-[0.2]"
            style={{ transform: 'scale(1.2)' }}
          />
        </div>
      </div>
    </div>
  );
};

const GuidedTour: React.FC<Props> = ({ run, steps: customSteps, onFinish }) => {
  const defaultSteps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: 'Terminal Initialized',
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-base text-zinc-200 font-medium">
            Welcome to the <span className="text-white font-bold">computation environment</span>.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            This environment is protected by <span className="text-blue-400 font-mono text-xs border border-blue-400/20 px-1 rounded bg-blue-400/5">hardware-level TEE encryption</span> for your security.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '#nav-dashboard',
      title: 'Credit Score Engine',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-zinc-300">Dispatch confidential scoring tasks to the secure <span className="text-white font-bold">TEE network</span>.</p>
        </div>
      ),
    },
    {
      target: '#nav-faucet',
      title: 'Faucet',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-zinc-300">Get <span className="text-blue-400 font-bold font-mono text-xs">Testnet ETH</span> and <span className="text-amber-500 font-bold font-mono text-xs">RLC</span> to fuel your confidential computations.</p>
        </div>
      ),
    },
    {
      target: '#nav-profile',
      title: 'Account Profile',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-zinc-300">View your <span className="text-white font-bold">verified credentials</span>, reputation score, and confidential history.</p>
        </div>
      ),
    },
    {
      target: '#nav-user',
      title: 'Secure Identity',
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-zinc-300">Your wallet <span className="text-emerald-500 font-bold">SGX Session</span> is always actie</p>
        </div>
      ),
    },
  ];

  const steps = customSteps || defaultSteps;

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish();
    }
  };

  return (
    <ReactJoyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          zIndex: 1000,
          overlayColor: 'rgba(0, 0, 0, 0.85)',
        },
        spotlight: {
          borderRadius: '16px',
        }
      }}
    />
  );
};

export default GuidedTour;
