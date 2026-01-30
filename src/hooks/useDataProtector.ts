import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useConnectorClient } from "./useWeb3Compat";
import type { IExecDataProtectorCore } from "@iexec/dataprotector";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import JSZip from "jszip"; // bundle with app to avoid runtime fetch failures
import { IExec } from "iexec"; // static import prevents dynamic chunk fetch errors

/**
 * Hook to convert a viem Wallet Client to an ethers Signer.
 * Required because iExec DataProtector SDK expects an ethers-like signer.
 */
function clientToSigner(client: any) {
  const { account, chain, transport } = client;

  // Get network name - provide fallback for custom chains
  const networkName = chain.name ||
    (chain.id === 134 ? 'iExec Sidechain' :
        `Chain ${chain.id}`);

  const network = {
    chainId: chain.id,
    name: networkName,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (!account || !account.address) {
    return undefined;
  }
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

/**
 * Hook to get an ethers Signer from Web3-Onboard Client.
 */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient({ chainId } as any);
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export interface DetailedFinancialData {
  income: {
    annualSalaryUSD: number;
    otherIncomeUSD: number;
    employmentStabilityMonths: number;
  };
  liabilities: {
    totalOutstandingDebtUSD: number;
    monthlyDebtPaymentUSD: number;
  };
  creditUtilization: {
    totalCreditLimitUSD: number;
    currentUtilizedUSD: number;
  };
  creditHistory: {
    oldestAccountMonths: number;
    averageAccountAgeMonths: number;
    latePayments: {
      "30D": number;
      "60D": number;
      "90D": number;
    };
  };
  creditMix: {
    creditCards: number;
    installmentLoans: number;
    mortgage: number;
  };
  newCredit: {
    hardInquiriesLast12Months: number;
    newAccountsLast12Months: number;
  };
}

export interface CreditScoreResult {
  score: number;
  grade: string;
  factors: { name: string; value: number }[];
  timestamp: number;
  taskId: string;
}

// iExec app address for Scora Confidential Credit Scoring
const SCORA_APP_ADDRESS = "0x5c52b4E664557C3e2353EBEd240A81a8A7ABEaF2";
const WORKERPOOL_ADDRESS = "0x0975bfce90f4748dab6d6729c96b33a2cd5491f5";
const MAX_PRICE = 100000000;

export function useDataProtector() {
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();

  const [dataProtectorCore, setDataProtectorCore] =
    useState<IExecDataProtectorCore | null>(null);
  const [dataProtector, setDataProtector] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initDataProtector = async () => {
      if (!isConnected || !address || !signer) {
        setIsInitialized(false);
        return;
      }

      try {
        console.log("[DataProtector] Initializing for Scora...");

        const { IExecDataProtector, IExecDataProtectorCore } = await import("@iexec/dataprotector");

        // Initialize Core (Protect, Grant)
        const dpCore = new IExecDataProtectorCore(window.ethereum);
        setDataProtectorCore(dpCore);

        // Initialize Main (Process) - requires ethers signer internally often
        // But for processProtectedData, Core is what we used in main.js
        // Let's stick to Core exactly like main.js

        setIsInitialized(true);
        console.log("[DataProtector] Scora Core Initialized");
      } catch (error) {
        console.error("[DataProtector] Initialization failed:", error);
        setIsInitialized(false);
      }
    };

    initDataProtector();
  }, [isConnected, address, signer]);

  const protectData = useCallback(async (data: DetailedFinancialData): Promise<string> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Scora] Protecting Data...');
    const protectedData = await dataProtectorCore.protectData({
      name: `Scora_Credit_Data_${Date.now()}`,
      data: {
        content: JSON.stringify(data),
      },
    });
    console.log(`[Scora] Protected Data Address: ${protectedData.address}`);
    return protectedData.address;
  }, [dataProtectorCore]);

  const grantAccess = useCallback(async (protectedDataAddress: string): Promise<string> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    if (!address) throw new Error("No wallet connected");
    console.log('[Scora] Granting Access...');
    const result = await dataProtectorCore.grantAccess({
      protectedData: protectedDataAddress,
      authorizedApp: SCORA_APP_ADDRESS,
      authorizedUser: address,
      pricePerAccess: 0,
      numberOfAccess: 1,
    });
    console.log('[Scora] Grant Access Result:', result);
    // Return the transaction hash if available, otherwise just valid
    return (result as any).txHash || (result as any).sign || "";
  }, [dataProtectorCore, address]);

  const processData = useCallback(async (protectedDataAddress: string): Promise<{ taskId: string, dealId: string }> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Scora] Computing (Direct Match)...');
    const result = await dataProtectorCore.processProtectedData({
      protectedData: protectedDataAddress,
      app: SCORA_APP_ADDRESS,
      workerpool: WORKERPOOL_ADDRESS,
      workerpoolMaxPrice: MAX_PRICE,
      appMaxPrice: MAX_PRICE,
      path: "result.json",
      onStatusUpdate: (status) => {
        console.log(`[TEE] ${status.title}`);
      }
    });
    console.log('[Scora] Process Data Result:', result);
    return { taskId: result.taskId, dealId: result.dealId };
  }, [dataProtectorCore]);

  const fetchResult = useCallback(async (taskId: string): Promise<CreditScoreResult> => {
    console.log('[Scora] Fetching Result for task:', taskId);

    const iexec = new IExec({ ethProvider: window.ethereum });

    // Fetch the result from iExec - this downloads the zip file
    console.log('[Scora] Downloading result zip for task:', taskId);
    const resultFile = await iexec.task.fetchResults(taskId);
    const blob = await resultFile.blob();

    console.log('[Scora] Unzipping result...');
    const zip = await JSZip.loadAsync(blob);

    // Check for error.json first
    const errorJson = await zip.file('error.json')?.async('string');
    if (errorJson) {
      console.error('[Scora] TEE execution failed:', errorJson);
      const errorData = JSON.parse(errorJson);
      throw new Error(errorData.message || 'TEE execution failed');
    }

    // Extract and parse result.json
    const resultJson = await zip.file('result.json')?.async('string');
    if (!resultJson) {
      throw new Error("Neither result.json nor error.json found in enclave output");
    }

    console.log('[Scora] Result extracted:', resultJson);
    const parsedData = JSON.parse(resultJson);

    // Convert factorBreakdown object to factors array
    const factors = parsedData.factorBreakdown ? Object.entries(parsedData.factorBreakdown).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()),
      value: value as number
    })) : [];

    const scoreResult = {
      score: parsedData.creditScore ?? parsedData.score ?? 0,
      grade: parsedData.grade || "N/A",
      factors: factors,
      timestamp: parsedData.timestamp || Date.now(),
      taskId: taskId
    };

    console.log('[Scora] Final score result:', scoreResult);
    return scoreResult;
  }, []);

  return {
    isInitialized,
    protectData,
    grantAccess,
    processData,
    fetchResult,
    dataProtectorCore,
  };
}
