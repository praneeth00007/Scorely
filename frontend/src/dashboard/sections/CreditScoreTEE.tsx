import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, ChevronLeft, RotateCcw, X, CheckCircle, Play, AlertCircle } from 'lucide-react';
import { useAccount } from '../../hooks/useWeb3Compat';
import { type DetailedFinancialData } from '../../hooks/useDataProtector';

// --- Types ---

interface ExecutionRecord {
  id: string;
  timestamp: string;
  taskId: string;
  status: 'COMPLETED' | 'FAILED';
  score?: number;
  grade?: string;
}

// --- Empty Initial State ---
const INITIAL_FORM: DetailedFinancialData = {
  income: { annualSalaryUSD: 0, otherIncomeUSD: 0, employmentStabilityMonths: 0 },
  liabilities: { totalOutstandingDebtUSD: 0, monthlyDebtPaymentUSD: 0 },
  creditUtilization: { totalCreditLimitUSD: 0, currentUtilizedUSD: 0 },
  creditHistory: { oldestAccountMonths: 0, averageAccountAgeMonths: 0, latePayments: { '30D': 0, '60D': 0, '90D': 0 } },
  creditMix: { creditCards: 0, installmentLoans: 0, mortgage: 0 },
  newCredit: { hardInquiriesLast12Months: 0, newAccountsLast12Months: 0 }
};

// --- Example Values ---
const EXAMPLE_VALUES: DetailedFinancialData = {
  income: { annualSalaryUSD: 72000, otherIncomeUSD: 3000, employmentStabilityMonths: 42 },
  liabilities: { totalOutstandingDebtUSD: 12000, monthlyDebtPaymentUSD: 450 },
  creditUtilization: { totalCreditLimitUSD: 25000, currentUtilizedUSD: 6250 }, // 25% utilization (Good)
  creditHistory: { oldestAccountMonths: 84, averageAccountAgeMonths: 48, latePayments: { '30D': 0, '60D': 0, '90D': 0 } },
  creditMix: { creditCards: 4, installmentLoans: 1, mortgage: 0 },
  newCredit: { hardInquiriesLast12Months: 1, newAccountsLast12Months: 0 }
};

const STEPS = [
  { title: 'Income & Stability', id: 1 },
  { title: 'Debt & Obligations', id: 2 },
  { title: 'Credit Utilization', id: 3 },
  { title: 'Credit History', id: 4 },
  { title: 'Final Inputs & Review', id: 5 }
];

const CreditScoreTEE = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DetailedFinancialData>(INITIAL_FORM);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // --- Load History on Mount ---
  useEffect(() => {
    const storedHistory = localStorage.getItem('reputation_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // --- Actions ---
  const handleOpenConfigure = () => {
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleLoadExample = () => {
    setFormData(EXAMPLE_VALUES);
  };

  const updateField = (path: string, value: number) => {
    setValidationError(null);
    const parts = path.split('.');
    setFormData(prev => {
      const next = { ...prev } as any;
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const validateData = (data: DetailedFinancialData): string | null => {
    try {
      if (data.income.annualSalaryUSD < 0) return "Annual Salary must be non-negative";
      if (data.income.otherIncomeUSD < 0) return "Other Income must be non-negative";
      if (data.income.employmentStabilityMonths < 0) return "Employment Stability must be non-negative";

      if (data.liabilities.totalOutstandingDebtUSD < 0) return "Total Outstanding Debt must be non-negative";
      if (data.liabilities.monthlyDebtPaymentUSD < 0) return "Monthly Debt Payment must be non-negative";

      if (data.creditUtilization.totalCreditLimitUSD <= 0) return "Total Credit Limit must be greater than 0";
      if (data.creditUtilization.currentUtilizedUSD < 0) return "Current Utilized Credit must be non-negative";
      if (data.creditUtilization.currentUtilizedUSD > data.creditUtilization.totalCreditLimitUSD)
        return "Current Utilized Credit cannot exceed Total Credit Limit";

      const monthlyIncome = data.income.annualSalaryUSD / 12;
      if (data.liabilities.monthlyDebtPaymentUSD > monthlyIncome && data.income.annualSalaryUSD > 0)
        return "Monthly Debt Payment cannot exceed monthly income (Annual Salary / 12)";

      if (data.creditHistory.oldestAccountMonths < 0) return "Oldest Account Months must be non-negative";
      if (data.creditHistory.averageAccountAgeMonths < 0) return "Average Account Age must be non-negative";
      if (data.creditHistory.oldestAccountMonths < data.creditHistory.averageAccountAgeMonths)
        return "Oldest Account Months must be greater than or equal to Average Account Age";

      const late = data.creditHistory.latePayments;
      if (late['30D'] < 0 || late['60D'] < 0 || late['90D'] < 0) return "Late Payments count must be non-negative";

      if (data.creditMix.creditCards < 0 || data.creditMix.installmentLoans < 0 || data.creditMix.mortgage < 0)
        return "Credit Mix counts must be non-negative";

      if (data.newCredit.hardInquiriesLast12Months < 0 || data.newCredit.newAccountsLast12Months < 0)
        return "New Credit counts must be non-negative";

      return null;
    } catch (e) {
      return "Invalid input data";
    }
  };

  const handleEncryptAndRun = () => {
    const error = validateData(formData);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    // Generate a Run ID (mock or real structure)
    // For demo purposes, we make it look like a real task ID or just a mock ID
    const runId = `run-${crypto.randomUUID().slice(0, 8)}`;

    // Persist data for recovery on refresh
    try {
      localStorage.setItem(`session_run_${runId}`, JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to persist run data", e);
    }

    navigate(`/run/${runId}`, { state: formData });
  };


  // --- Render Steps (Stepper) ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Income
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Annual Salary (USD)</label>
              <input type="number" value={formData.income.annualSalaryUSD || ''} onChange={e => updateField('income.annualSalaryUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Other Income (USD)</label>
              <input type="number" value={formData.income.otherIncomeUSD || ''} onChange={e => updateField('income.otherIncomeUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Employment Stability (Months)</label>
              <input type="number" value={formData.income.employmentStabilityMonths || ''} onChange={e => updateField('income.employmentStabilityMonths', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
          </div>
        );
      case 2: // Debt
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Total Outstanding Debt (USD)</label>
              <input type="number" value={formData.liabilities.totalOutstandingDebtUSD || ''} onChange={e => updateField('liabilities.totalOutstandingDebtUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Monthly Debt Payment (USD)</label>
              <input type="number" value={formData.liabilities.monthlyDebtPaymentUSD || ''} onChange={e => updateField('liabilities.monthlyDebtPaymentUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
          </div>
        );
      case 3: // Utilization
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Total Credit Limit (USD)</label>
              <input type="number" value={formData.creditUtilization.totalCreditLimitUSD || ''} onChange={e => updateField('creditUtilization.totalCreditLimitUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">Current Utilized Credit (USD)</label>
              <input type="number" value={formData.creditUtilization.currentUtilizedUSD || ''} onChange={e => updateField('creditUtilization.currentUtilizedUSD', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
            </div>
          </div>
        );
      case 4: // History
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Oldest Account (Months)</label>
                <input type="number" value={formData.creditHistory.oldestAccountMonths || ''} onChange={e => updateField('creditHistory.oldestAccountMonths', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Avg Account Age (Months)</label>
                <input type="number" value={formData.creditHistory.averageAccountAgeMonths || ''} onChange={e => updateField('creditHistory.averageAccountAgeMonths', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" placeholder="0" />
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <label className="text-xs text-slate-500 block mb-4 uppercase tracking-widest font-bold">Late Payments (Count)</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 block">30 Days</label>
                  <input type="number" value={formData.creditHistory.latePayments['30D'] || ''} onChange={e => updateField('creditHistory.latePayments.30D', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 block">60 Days</label>
                  <input type="number" value={formData.creditHistory.latePayments['60D'] || ''} onChange={e => updateField('creditHistory.latePayments.60D', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 block">90 Days</label>
                  <input type="number" value={formData.creditHistory.latePayments['90D'] || ''} onChange={e => updateField('creditHistory.latePayments.90D', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        );
      case 5: // Mix & Final
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Credit Cards</label>
                <input type="number" value={formData.creditMix.creditCards || ''} onChange={e => updateField('creditMix.creditCards', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Loans</label>
                <input type="number" value={formData.creditMix.installmentLoans || ''} onChange={e => updateField('creditMix.installmentLoans', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Mortgages</label>
                <input type="number" value={formData.creditMix.mortgage || ''} onChange={e => updateField('creditMix.mortgage', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">Hard Inquiries (12m)</label>
                <input type="number" value={formData.newCredit.hardInquiriesLast12Months || ''} onChange={e => updateField('newCredit.hardInquiriesLast12Months', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 block">New Accounts (12m)</label>
                <input type="number" value={formData.newCredit.newAccountsLast12Months || ''} onChange={e => updateField('newCredit.newAccountsLast12Months', +e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none transition-colors font-mono" />
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 text-[11px] text-blue-200 mt-4 flex gap-3 items-start">
              <Shield size={16} className="shrink-0 mt-0.5" />
              <p>Inputs will be encrypted locally and executed inside a secure enclave. No raw data leaves your device.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto font-sans text-slate-300">

      {/* 1. PAGE HEADER */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Credit Score Engine</h1>
          <p className="text-xs text-slate-500 font-medium">Confidential computation via hardware enclave</p>
        </div>

        {/* 2. GLOBAL STATUS BAR */}
        <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Enclave</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Data:</span>
            <span className="text-slate-200">Encrypted</span>
          </div>
        </div>
      </header>

      {/* 3. PRIMARY ACTION CARD */}
      <section className="mb-12">
        <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg text-white font-bold mb-1">New Credit Score</h2>
            <p className="text-sm text-slate-500">Configure credit inputs and execute confidential scoring.</p>
          </div>
          <button
            onClick={handleOpenConfigure}
            className="bg-white text-slate-950 px-6 py-3 rounded-md font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            Configure & Run <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* 5. EXECUTION HISTORY */}
      <section>
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          Execution History
        </h3>

        <div className="overflow-hidden border border-slate-800 rounded-lg bg-slate-900/20">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-normal">Run ID</th>
                <th className="px-6 py-4 font-normal">Timestamp</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-600 italic font-sans">
                    No completed executions yet.
                  </td>
                </tr>
              ) : (
                history.map(run => (
                  <tr key={run.id} className="transition-colors">
                    <td className="px-6 py-4 text-slate-400">
                      <Link
                        to={`/run/${run.taskId}`} /* Going to run page even for history, or maybe result page? The user said "Run Page ... History now shows the completed run". */
                        /* Let's point to /run/:id because that page handles "completed" state too. */
                        className="flex items-center gap-1"
                      >
                        {run.taskId.slice(0, 10)}... <ChevronRight size={10} />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{run.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${run.status === 'COMPLETED' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      {run.score ? (
                        <span>{run.score} <span className="text-slate-500 text-[10px]">({run.grade})</span></span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CONFIGURATION MODAL (STEPPER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1116] border border-slate-700 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Configure Credit Profile</h3>
                <p className="text-xs text-slate-400 mt-1">Status: Configuring local inputs</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLoadExample}
                  className="text-xs font-bold text-blue-400 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                >
                  <RotateCcw size={12} /> Load Example Values
                </button>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Progress Bar (Stepper) */}
            <div className="px-6 pt-6 flex gap-1">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${currentStep >= step.id ? 'bg-blue-500' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            <div className="px-6 pt-2 pb-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Step {currentStep}: {STEPS[currentStep - 1].title}</span>
              <span>{currentStep} / {STEPS.length}</span>
            </div>

            {/* Modal Body (Content) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 text-xs text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {validationError}
                </div>
              )}
              {renderStepContent()}
            </div>

            {/* Modal Footer (Navigation) */}
            <div className="p-6 border-t border-slate-800 bg-[#0c0e12] rounded-b-lg flex items-center justify-between mt-auto">
              <button
                onClick={() => {
                  setValidationError(null);
                  setCurrentStep(prev => Math.max(1, prev - 1));
                }}
                disabled={currentStep === 1}
                className="text-slate-400 disabled:opacity-30 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => {
                    setValidationError(null);
                    setCurrentStep(prev => Math.min(5, prev + 1));
                  }}
                  className="bg-white text-black px-6 py-2.5 rounded font-bold text-sm transition-colors flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleEncryptAndRun}
                  className="bg-emerald-500 text-black px-6 py-2.5 rounded font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  Encrypt & Run Securely <Play size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreditScoreTEE;
