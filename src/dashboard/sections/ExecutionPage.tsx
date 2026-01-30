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
    const { protectData, grantAccess, processData, fetchResult, isInitialized } = useDataProtector();

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

    // --- Persistence & Resume Logic ---
    const saveState = (updates: any) => {
        if (!runId) return;
        const key = `scora_execution_${runId}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        const newState = { ...current, ...updates };
        localStorage.setItem(key, JSON.stringify(newState));
    };

    const getSavedState = () => {
        if (!runId) return {};
        return JSON.parse(localStorage.getItem(`scora_execution_${runId}`) || '{}');
    };

    const handleDownload = () => {
        if (score === null || !runId) return;
        const report = `
SCORA CREDIT REPORT
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

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runExecution = async () => {
        setStatus('running');
        let formData = location.state;

        // --- HISTORICAL VIEW MODE ---
        // If runId looks like an iExec Task ID (0x...), we are viewing a past result.
        // We don't need input data, we just fetch the result from the chain/datasets.
        const isHistorical = runId?.startsWith('0x');

        if (isHistorical) {
            addLog(`Viewing historical result for Task: ${runId}`);

            // Mark previous steps as complete for visual consistency
            updateTimeline('ENCRYPT', 'complete', 'History');
            updateTimeline('GRANT', 'complete', 'History');
            updateTimeline('EXECUTE', 'complete', 'History');
            updateTimeline('RESULT', 'pending');

            try {
                const result = await fetchResult(runId!);
                updateTimeline('RESULT', 'complete', `Score: ${result.score}`, `https://explorer.iex.ec/bellecour/task/${runId}`);
                setScore(result.score);
                setGrade(result.grade);
                setStatus('completed');
                addLog("Historical result loaded successfully.");
            } catch (err: any) {
                console.error("Failed to fetch history:", err);
                setStatus('failed');
                addLog(`Error fetching result: ${err.message}`);
                updateTimeline('RESULT', 'error', err.message);
            }
            return;
        }

        // --- NEW EXECUTION MODE ---

        // 1. Recover Input Data
        if (!formData && runId) {
            const stored = localStorage.getItem(`scora_run_${runId}`);
            if (stored) {
                try {
                    formData = JSON.parse(stored);
                    addLog("Restored input data from local storage.");
                } catch (e) {
                    console.error("Failed to parse stored data", e);
                }
            }
        }

        if (!formData) {
            addLog("No financial data found. Cannot run.");
            updateTimeline('ENCRYPT', 'error', 'Missing inputs');
            setStatus('failed');
            return;
        }

        // 2. Load Previous Execution State (for Resume)
        const savedState = getSavedState();

        try {
            addLog("Starting Confidential Computing Flow...");
            addLog(`Run ID: ${runId}`);

            // --- STEP 1: ENCRYPT ---
            let protectedAddress = savedState.protectedAddress;
            if (protectedAddress) {
                addLog("Found existing protected data. Skipping encryption.");
                updateTimeline('ENCRYPT', 'complete', `${protectedAddress.slice(0, 10)}...`, `https://explorer.iex.ec/bellecour/dataset/${protectedAddress}`);
            } else {
                updateTimeline('ENCRYPT', 'pending', 'Encrypting financial data locally...');
                protectedAddress = await protectData(formData);
                saveState({ protectedAddress });
                updateTimeline('ENCRYPT', 'complete', `${protectedAddress.slice(0, 10)}...`, `https://explorer.iex.ec/bellecour/dataset/${protectedAddress}`);
            }

            await sleep(3000); // UX Delay

            // --- STEP 2: GRANT ---
            let isGranted = savedState.isGranted;
            if (isGranted) {
                addLog("Access already granted. Skipping grant step.");
                updateTimeline('GRANT', 'complete', 'Restricted to TEE');
            } else {
                updateTimeline('GRANT', 'pending', 'Authorizing TEE app to access encrypted data...');
                await grantAccess(protectedAddress);
                saveState({ isGranted: true });
                updateTimeline('GRANT', 'complete', 'Restricted to TEE');
            }

            await sleep(3000); // UX Delay

            // --- STEP 3: EXECUTE ---
            let taskId = savedState.taskId;
            let dealId = savedState.dealId;

            if (taskId && dealId) {
                addLog("Found existing execution task. Skipping execution.");
                updateTimeline('EXECUTE', 'complete', `Deal: ${dealId.slice(0, 10)}...`, `https://explorer.iex.ec/bellecour/deal/${dealId}`);
            } else {
                updateTimeline('EXECUTE', 'pending', 'Running scoring algorithm in Intel SGX enclave...');
                const result = await processData(protectedAddress);
                taskId = result.taskId;
                dealId = result.dealId;
                saveState({ taskId, dealId });
                updateTimeline('EXECUTE', 'complete', `Deal: ${dealId.slice(0, 10)}...`, `https://explorer.iex.ec/bellecour/deal/${dealId}`);
            }

            await sleep(3000); // UX Delay

            // --- STEP 4: RESULT ---
            // Always fetch result to ensure we have the latest status/score
            updateTimeline('RESULT', 'pending', 'Verifying computation result on-chain...');
            const result = await fetchResult(taskId);

            // Switch URL to Task ID upon completion for consistency
            navigate(`/run/${taskId}`, { replace: true });

            updateTimeline('RESULT', 'complete', `Score: ${result.score}`, `https://explorer.iex.ec/bellecour/task/${taskId}`);

            setScore(result.score);
            setGrade(result.grade);
            setStatus('completed');
            saveState({ completed: true, score: result.score, grade: result.grade });

            // Save to History (De-dupe logic or overwrite)
            const existingHistory = JSON.parse(localStorage.getItem('scora_history') || '[]');
            // Check if already exists
            if (!existingHistory.find((h: any) => h.taskId === taskId)) {
                const newRecord = {
                    id: crypto.randomUUID().slice(0, 8),
                    timestamp: new Date().toLocaleTimeString(),
                    taskId: taskId,
                    status: 'COMPLETED',
                    score: result.score,
                    grade: result.grade
                };
                localStorage.setItem('scora_history', JSON.stringify([newRecord, ...existingHistory]));
            }

        } catch (err: any) {
            console.error("Execution Failed:", err);
            setStatus('failed');
            addLog(`Error: ${err.message || err}`);

            const currentStep = timeline.find(s => s.status === 'pending');
            if (currentStep) {
                updateTimeline(currentStep.id, 'error', err.message);

                // CRITICAL FIX: If execution failed, the one-time access grant might be burnt or invalid.
                // We must invalidate 'isGranted' so the user can sign again on retry.
                if (currentStep.id === 'EXECUTE') {
                    addLog("Invalidating previous access grant to allow retry...");
                    saveState({ isGranted: false });
                }
            }
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
                                    <a href={`https://explorer.iex.ec/bellecour/task/${timeline[2].explorerLink?.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2 border border-slate-700 text-slate-300 font-bold text-xs rounded hover:border-slate-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide">
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
                                score === 0 ? (
                                    <span className="text-xl font-bold text-slate-400 uppercase tracking-widest text-center">Not Eligible</span>
                                ) : (
                                    <span className="text-6xl font-bold text-white tracking-tighter leading-none">{score}</span>
                                )
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
