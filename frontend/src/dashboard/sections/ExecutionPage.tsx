import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, ExternalLink, ChevronLeft, Download, Eye, Terminal } from 'lucide-react';
import { useDataProtector } from '../../hooks/useDataProtector';

interface TimelineStep {
    id: 'ENCRYPT' | 'GRANT' | 'EXECUTE' | 'RESULT';
    label: string;
    status: 'idle' | 'pending' | 'complete' | 'error';
    timestamp?: string;
    details?: string;
    explorerLink?: string;
}

const ExecutionPage = () => {
    const { runId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { protectData, grantAccess, processData, fetchResult, isInitialized, checkAndStake } = useDataProtector();

    const [status, setStatus] = useState<'initializing' | 'running' | 'completed' | 'failed'>('initializing');
    const [score, setScore] = useState<number | null>(null);
    const [grade, setGrade] = useState<string | null>(null);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const [timeline, setTimeline] = useState<TimelineStep[]>([
        { id: 'ENCRYPT', label: 'Encrypt & Upload', status: 'idle' },
        { id: 'GRANT', label: 'Grant TEE Access', status: 'idle' },
        { id: 'EXECUTE', label: 'Secure Execution', status: 'idle' },
        { id: 'RESULT', label: 'Verify & Decrypt', status: 'idle' },
    ]);

    // Gauge Config
    const MIN_SCORE = 300;
    const MAX_SCORE = 900;

    const addLog = (msg: string) => setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const updateTimeline = (id: string, status: 'idle' | 'pending' | 'complete' | 'error', details?: string, explorerLink?: string) => {
        setTimeline(prev => prev.map(step =>
            step.id === id ? {
                ...step,
                status,
                timestamp: status !== 'idle' && status !== 'pending' ? new Date().toLocaleTimeString() : undefined,
                details,
                explorerLink
            } : step
        ));
        // Add to log for visibility
        if (status === 'pending') addLog(`Started: ${id}...`);
        if (status === 'complete') addLog(`Completed: ${id} (${details})`);
        if (status === 'error') addLog(`Failed: ${id} - ${details}`);
    };

    useEffect(() => {
        if (status === 'initializing' && isInitialized) {
            runExecution();
        } else if (status === 'initializing' && !isInitialized) {
            addLog("Waiting for DataProtector initialization...");
        }
    }, [status, isInitialized]);

    // Safety: Persist input data immediately so reloads don't wipe it
    useEffect(() => {
        if (location.state && runId) {
            localStorage.setItem(`session_run_${runId}`, JSON.stringify(location.state));
        }
    }, [location.state, runId]);

    // --- Persistence & Resume Logic ---
    const saveState = (updates: any) => {
        if (!runId) return;
        const key = `session_exec_${runId}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        const newState = { ...current, ...updates };
        localStorage.setItem(key, JSON.stringify(newState));
    };

    const getSavedState = () => {
        if (!runId) return {};
        return JSON.parse(localStorage.getItem(`session_exec_${runId}`) || '{}');
    };

    const handleDownload = () => {
        if (score === null || !runId) return;
        const report = `
SCORE REPORT
-------------------
Run ID:    ${runId}
Date:      ${new Date().toLocaleString()}
Status:    ${status.toUpperCase()}

CREDIT SCORE: ${score}
GRADE:        ${grade}

-------------------
This report was generated securely via iExec Confidential Computing.
The computation was performed inside an Intel SGX enclave.
Task ID: ${timeline[3].explorerLink?.split('/').pop() || 'N/A'}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CreditScore-${runId.slice(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const runExecution = async () => {
        if (status === 'running' || status === 'completed') return;
        setStatus('running');
        let formData = location.state;

        const isHistorical = runId?.startsWith('0x');

        // Recovery: Check if this Task ID belongs to a recent session we have in memory
        const savedState = getSavedState();

        if (isHistorical) {
            addLog(`Viewing result for Task: ${runId}`);

            // If we already have the score in state, don't fetch again
            if (savedState.completed && savedState.score !== undefined) {
                setScore(savedState.score);
                setGrade(savedState.grade);
                setStatus('completed');
                updateTimeline('ENCRYPT', 'complete', 'Vault');
                updateTimeline('GRANT', 'complete', 'Authorized');
                updateTimeline('EXECUTE', 'complete', 'Processed');
                updateTimeline('RESULT', 'complete', `Score: ${savedState.score}`, `https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${runId}`);
                return;
            }

            // Sync Timeline for visual consistency
            updateTimeline('ENCRYPT', 'complete', 'Authenticated');
            updateTimeline('GRANT', 'complete', 'Authorized');
            updateTimeline('EXECUTE', 'complete', 'Verified');
            updateTimeline('RESULT', 'pending');

            try {
                const result = await fetchResult(runId!);
                updateTimeline('RESULT', 'complete', `Score: ${result.score}`, `https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${runId}`);
                setScore(result.score);
                setGrade(result.grade);
                setStatus('completed');
                saveState({ completed: true, score: result.score, grade: result.grade });
                addLog("Result loaded successfully.");
            } catch (err: any) {
                console.error("Failed to fetch result:", err);
                setStatus('failed');
                addLog(`Error: ${err.message}`);
                updateTimeline('RESULT', 'error', err.message);
            }
            return;
        }

        // --- NEW EXECUTION MODE ---
        if (!formData && runId) {
            const stored = localStorage.getItem(`session_run_${runId}`);
            if (stored) {
                try { formData = JSON.parse(stored); } catch (e) { }
            }
        }

        if (!formData) {
            addLog("No session data found.");
            setStatus('failed');
            return;
        }

        try {
            console.log("[Engine] Starting Secure Computation with formData:", formData);
            if (!formData || !formData.income) {
                console.error("[Engine] Invalid formData structure. Missing 'income' section.", formData);
                addLog("Error: Invalid data structure. Missing 'income'.");
                setStatus('failed');
                return;
            }
            addLog("Starting Secure Computation...");

            // --- STEP 1: ENCRYPT ---
            let protectedAddress = savedState.protectedAddress;

            // If we are coming from a failed state, let's re-encrypt to ensure fresh data
            if (status === 'failed' || !protectedAddress) {
                addLog("Encrypting fresh metrics...");
                updateTimeline('ENCRYPT', 'pending', 'Encrypting metrics...');
                protectedAddress = await protectData(formData);
                saveState({ protectedAddress, isGranted: false }); // Reset grant for new address
            }
            updateTimeline('ENCRYPT', 'complete', `${protectedAddress.slice(0, 10)}...`, `https://explorer.iex.ec/arbitrum-sepolia-testnet/dataset/${protectedAddress}`);

            // --- STEP 2: GRANT ---
            if (!savedState.isGranted) {
                updateTimeline('GRANT', 'pending', 'Authorizing TEE Enclave...');
                await grantAccess(protectedAddress);
                saveState({ isGranted: true });
            }
            updateTimeline('GRANT', 'complete', 'Access Authorized');

            // --- STEP 3: EXECUTE ---
            let taskId = savedState.taskId;
            let dealId = savedState.dealId;

            if (!taskId) {
                updateTimeline('EXECUTE', 'pending', 'Checking RLC stake...');
                try {
                    const { staked, balance } = await checkAndStake();
                    if (staked) {
                        addLog(`Testnet RLC deposited. Stake: ${balance}`);
                    }
                } catch (e: any) {
                    addLog(`Stake Warning: ${e.message}`);
                    // Continue anyway, it might work if just enough
                }

                updateTimeline('EXECUTE', 'pending', 'Executing in Intel SGX...');

                const result = await processData(protectedAddress, (status: any) => {
                    // CATCH TASK ID MID-FLIGHT
                    if (status.payload?.taskId && !taskId) {
                        const midId = status.payload.taskId;
                        addLog(`Task created: ${midId.slice(0, 10)}...`);
                        saveState({ taskId: midId });
                        // Also pre-create the task-based session key to allow seamless reload
                        localStorage.setItem(`session_exec_${midId}`, JSON.stringify({
                            ...getSavedState(),
                            taskId: midId,
                        }));
                    }
                    if (status.payload?.dealId) saveState({ dealId: status.payload.dealId });
                });

                taskId = result.taskId;
                dealId = result.dealId;
                saveState({ taskId, dealId });
            }
            updateTimeline('EXECUTE', 'complete', `Deal: ${dealId?.slice(0, 10)}...`, `https://explorer.iex.ec/arbitrum-sepolia-testnet/deal/${dealId}`);

            // --- STEP 4: RESULT ---
            updateTimeline('RESULT', 'pending', 'Fetching results...');
            const finalResult = await fetchResult(taskId);

            // CRITICAL: Update the task session state
            const taskKey = `session_exec_${taskId}`;
            const finalData = {
                ...getSavedState(),
                taskId,
                dealId,
                completed: true,
                score: finalResult.score,
                grade: finalResult.grade
            };
            localStorage.setItem(taskKey, JSON.stringify(finalData));

            setScore(finalResult.score);
            setGrade(finalResult.grade);
            setStatus('completed');

            navigate(`/run/${taskId}`, { replace: true });
            updateTimeline('RESULT', 'complete', `Score: ${finalResult.score}`, `https://explorer.iex.ec/arbitrum-sepolia-testnet/task/${taskId}`);
            addLog("Processing complete.");

            // Save to Persistent History
            const history = JSON.parse(localStorage.getItem('reputation_history') || '[]');
            if (!history.find((h: any) => h.taskId === taskId)) {
                localStorage.setItem('reputation_history', JSON.stringify([{
                    id: taskId.slice(0, 8),
                    timestamp: new Date().toLocaleTimeString(),
                    taskId,
                    status: 'COMPLETED',
                    score: finalResult.score,
                    grade: finalResult.grade
                }, ...history]));
            }
        } catch (err: any) {
            console.error("Execution Flow Error:", err);
            setStatus('failed');
            addLog(`Error: ${err.message || 'Unknown error'}`);
            const currentStep = timeline.find(s => s.status === 'pending');
            if (currentStep) updateTimeline(currentStep.id, 'error', err.message);

            // On EXECUTE fail, allow retry by clearing grant if needed
            if (currentStep?.id === 'EXECUTE') saveState({ isGranted: false });
        }
    };

    return (
        <div className="max-w-4xl mx-auto font-sans text-slate-300">
            {/* HEADER */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Execution Status</h1>
                    <p className="text-xs text-slate-500 font-medium">Run ID: {runId}</p>
                </div>
                {status === 'failed' && (
                    <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-slate-700">
                        Retry
                    </button>
                )}
            </header>

            {/* STATUS & GAUGE SECTION */}
            <section className="mb-12">
                <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-8 flex flex-col sm:flex-row items-center justify-between gap-12">

                    {/* Left Info */}
                    <div className="flex-1">
                        {status === 'completed' ? (
                            <>
                                <h2 className="text-lg text-emerald-400 font-bold mb-2 flex items-center gap-2">
                                    <CheckCircle size={20} /> Computation Successful
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                    Secure execution completed.
                                    The result is cryptographically verified and attested by the TEE.
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={handleDownload} className="px-5 py-2 bg-white text-slate-950 font-bold text-xs rounded hover:bg-slate-200 transition-colors flex items-center gap-2 uppercase tracking-wide">
                                        <Download size={14} /> Download Report
                                    </button>
                                    <a href={timeline.find(t => t.id === 'RESULT')?.explorerLink} target="_blank" rel="noopener noreferrer" className="px-5 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded hover:border-slate-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide">
                                        <ExternalLink size={14} /> Verify On-Chain
                                    </a>
                                </div>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <h2 className="text-lg text-red-500 font-bold mb-2 flex items-center gap-2">
                                    <AlertCircle size={20} /> Execution Failed
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                    There was an error during the confidential computation. Please check the logs below and try again.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg text-blue-400 font-bold mb-2 animate-pulse flex items-center gap-2">
                                    <Shield size={20} className="animate-pulse" /> Processing in Enclave...
                                </h2>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Your data is being encrypted and processed inside a Trusted Execution Environment (Intel SGX).
                                    No raw data is visible to the host or any intermediaries.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Right Gauge */}
                    <div className="relative w-64 h-32 flex-shrink-0">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                            {/* Track */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            {/* Value */}
                            <path
                                d="M 20 100 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke={status === 'completed' ? '#34d399' : status === 'failed' ? '#ef4444' : '#3b82f6'}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset={status === 'completed' && score
                                    ? 251.2 - ((score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 251.2
                                    : 251.2}
                                className={`transition-all duration-[1500ms] ease-out ${status === 'running' ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-end mt-4">
                            {status === 'completed' && score !== null ? (
                                <>
                                    <div className="w-12 h-12 mb-4 animate-in fade-in zoom-in duration-1000">
                                        <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain opacity-50" />
                                    </div>
                                    {score === 0 ? (
                                        <span className="text-xl font-bold text-slate-400 uppercase tracking-widest text-center">Not Eligible</span>
                                    ) : (
                                        <span className="text-6xl font-bold text-white tracking-tighter leading-none">{score}</span>
                                    )}
                                </>
                            ) : status === 'failed' ? (
                                <span className="text-red-500 text-sm font-bold font-mono">ERROR</span>
                            ) : (
                                <span className="text-slate-600 text-sm font-mono animate-pulse">CALCULATING</span>
                            )}
                        </div>
                    </div>

                </div>
            </section>

            {/* TIMELINE & LOGS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Timeline */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Execution Pipeline</h3>
                    <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/20">
                        <div className="relative">
                            {timeline.map((step, index) => {
                                const isPending = step.status === 'pending';
                                const isComplete = step.status === 'complete';
                                const isError = step.status === 'error';
                                const isIdle = step.status === 'idle';
                                const isLast = index === timeline.length - 1;

                                return (
                                    <div key={step.id} className={`relative z-10 pl-10 ${!isLast ? 'pb-8' : ''}`}>
                                        {/* Connector Line */}
                                        {!isLast && (
                                            <div className={`absolute left-3 top-6 bottom-0 w-[1px] transition-colors duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                        )}

                                        {/* Status Dot */}
                                        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-950 transition-colors ${isComplete ? 'border-emerald-500 text-emerald-500' :
                                            isPending ? 'border-white text-white animate-pulse' :
                                                isError ? 'border-red-500 text-red-500' :
                                                    'border-slate-700 text-slate-700'
                                            }`}>
                                            {isComplete && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                            {isPending && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            {isError && <AlertCircle size={10} />}
                                        </div>

                                        <div className={`${isIdle ? 'opacity-40' : 'opacity-100'} transition-opacity mt-0.5`}>
                                            <h4 className={`text-sm font-bold mb-0.5 ${isPending ? 'text-white' : isComplete ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {step.label}
                                            </h4>
                                            <div className="flex flex-col gap-1 text-[11px] font-mono">
                                                {step.status !== 'idle' && (
                                                    <span className={`uppercase font-bold tracking-tight ${isPending ? 'text-blue-400' : isComplete ? 'text-emerald-500' : isError ? 'text-red-500' : ''}`}>
                                                        {step.status}
                                                    </span>
                                                )}
                                                {step.explorerLink ? (
                                                    <a href={step.explorerLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-1 max-w-[250px] truncate">
                                                        {step.details} <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    step.details && <span className="text-slate-500 mt-1 block text-xs" title={step.details}>{step.details}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Live Logs */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Terminal size={12} /> Live Trace
                    </h3>
                    <div className="border border-slate-800 rounded-lg p-4 bg-slate-950 font-mono text-[10px] text-slate-400 h-[300px] overflow-y-auto">
                        {debugLog.length === 0 ? (
                            <span className="text-slate-700 italic">Waiting for execution to start...</span>
                        ) : (
                            debugLog.map((log, i) => (
                                <div key={i} className="mb-1 border-b border-slate-900 pb-1 last:border-0 last:pb-0">
                                    <span className="text-slate-600 mr-2">{log.split(']')[0]}]</span>
                                    <span className={log.includes('Error') ? 'text-red-400' : 'text-slate-300'}>
                                        {log.split(']').slice(1).join(']')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ExecutionPage;
