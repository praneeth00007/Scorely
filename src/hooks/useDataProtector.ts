import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useConnectorClient } from "./useWeb3Compat";
import type { IExecDataProtectorCore } from "@iexec/dataprotector";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import JSZip from "jszip";
import { IExec } from "iexec";

// iExec app address for the computation engine Credit Scoring
const RESOURCE_APP_ADDRESS = "0x5c52b4E664557C3e2353EBEd240A81a8A7ABEaF2";
const WORKERPOOL_ADDRESS = "0x0975bfce90f4748dab6d6729c96b33a2cd5491f5";
const MAX_PRICE = 100000000;

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

export function useDataProtector() {
  const { address, isConnected } = useAccount();
  const { data: client } = useConnectorClient();

  const [dataProtectorCore, setDataProtectorCore] =
    useState<IExecDataProtectorCore | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the SDK
  useEffect(() => {
    const initDataProtector = async () => {
      if (!isConnected || !address || !client?.transport) {
        setIsInitialized(false);
        return;
      }

      try {
        console.log("[DataProtector] Initializing for the computation engine...");

        const { IExecDataProtectorCore } = await import("@iexec/dataprotector");

        // Initialize Core with the provider
        const dpCore = new IExecDataProtectorCore(client.transport);
        setDataProtectorCore(dpCore);

        setIsInitialized(true);
        console.log("[DataProtector] the computation engine Core Initialized");
      } catch (error) {
        console.error("[DataProtector] Initialization failed:", error);
        setIsInitialized(false);
      }
    };

    initDataProtector();
  }, [isConnected, address, client]);

  const protectData = useCallback(async (data: DetailedFinancialData): Promise<string> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Engine] Protecting Data...');
    const protectedData = await dataProtectorCore.protectData({
      name: `the computation engine_Credit_Data_${Date.now()}`,
      data: {
        content: JSON.stringify(data),
      },
    });
    console.log(`[Engine] Protected Data Address: ${protectedData.address}`);
    return protectedData.address;
  }, [dataProtectorCore]);

  const grantAccess = useCallback(async (protectedDataAddress: string): Promise<string> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    if (!address) throw new Error("No wallet connected");
    console.log('[Engine] Granting Access...');
    const result = await dataProtectorCore.grantAccess({
      protectedData: protectedDataAddress,
      authorizedApp: RESOURCE_APP_ADDRESS,
      authorizedUser: address,
      pricePerAccess: 0,
      numberOfAccess: 1,
    });
    console.log('[Engine] Grant Access Result:', result);
    return (result as any).txHash || (result as any).sign || "granted";
  }, [dataProtectorCore, address]);

  const processData = useCallback(async (protectedDataAddress: string): Promise<{ taskId: string, dealId: string }> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Engine] Computing (Direct Match)...');

    const result = await dataProtectorCore.processProtectedData({
      protectedData: protectedDataAddress,
      app: RESOURCE_APP_ADDRESS,
      workerpool: WORKERPOOL_ADDRESS,
      workerpoolMaxPrice: MAX_PRICE,
      appMaxPrice: MAX_PRICE,
      path: "result.json",
      onStatusUpdate: (status) => {
        console.log(`[TEE] ${status.title}`);
      }
    });
    console.log('[Engine] Process Data Result:', result);
    return { taskId: result.taskId, dealId: result.dealId };
  }, [dataProtectorCore]);

  const fetchResult = useCallback(async (taskId: string): Promise<CreditScoreResult> => {
    console.log('[Engine] Fetching Result for task:', taskId);

    const iexec = new IExec({ ethProvider: (window as any).ethereum });

    console.log('[Engine] Downloading result zip for task:', taskId);
    const resultFile = await iexec.task.fetchResults(taskId);
    const blob = await resultFile.blob();

    console.log('[Engine] Unzipping result...');
    const zip = await JSZip.loadAsync(blob);

    const errorJson = await zip.file('error.json')?.async('string');
    if (errorJson) {
      console.error('[Engine] TEE execution failed:', errorJson);
      const errorData = JSON.parse(errorJson);
      throw new Error(errorData.message || 'TEE execution failed');
    }

    const resultJson = await zip.file('result.json')?.async('string');
    if (!resultJson) {
      throw new Error("Neither result.json nor error.json found in enclave output");
    }

    console.log('[Engine] Result extracted:', resultJson);
    const parsedData = JSON.parse(resultJson);

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

    console.log('[Engine] Final score result:', scoreResult);
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
