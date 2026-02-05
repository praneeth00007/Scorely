import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useConnectorClient } from "./useWeb3Compat";
import type { IExecDataProtectorCore } from "@iexec/dataprotector";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import JSZip from "jszip";
import { IExec } from "iexec";

// iExec app address for the computation engine Credit Scoring
const RESOURCE_APP_ADDRESS = "0x48fa09C008C382Fe8E892742ab8e43117D797dcb";
const WORKERPOOL_ADDRESS = "0xb967057a21dc6a66a29721d96b8aa7454b7c383f";
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

  const [dataProtector, setDataProtector] =
    useState<any>(null);
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
        console.log(`[DataProtector] Initializing for chain: ${client.chain.id}`);

        const { IExecDataProtector } = await import("@iexec/dataprotector");

        const dp = new IExecDataProtector(client.transport);

        setDataProtector(dp);
        setDataProtectorCore(dp.core);

        setIsInitialized(true);
        console.log("[DataProtector] Computation engine SDK Initialized");
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
        content: new TextEncoder().encode(JSON.stringify(data)),
      },
    });
    console.log(`[Engine] Data Protected successfully at: ${protectedData.address}`);
    console.log('[Engine] Original Data Structure sent to TEE:', data);
    return protectedData.address;
  }, [dataProtectorCore]);

  const grantAccess = useCallback(async (protectedDataAddress: string): Promise<string> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    if (!address) throw new Error("No wallet connected");
    console.log('[Engine] Granting Access...');
    const result = await dataProtectorCore.grantAccess({
      protectedData: protectedDataAddress,
      authorizedApp: RESOURCE_APP_ADDRESS,
      authorizedUser: address, // Required by type definition
      pricePerAccess: 0,
      numberOfAccess: 100,
    });
    console.log('[Engine] Grant Access Result:', result);
    return (result as any).txHash || (result as any).sign || "granted";
  }, [dataProtectorCore, address]);

  const processData = useCallback(async (protectedDataAddress: string, onStatusUpdate?: (status: any) => void): Promise<{ taskId: string, dealId: string }> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Engine] Computing (Direct Match)...');

    const result = await dataProtectorCore.processProtectedData({
      protectedData: protectedDataAddress,
      app: RESOURCE_APP_ADDRESS,
      workerpool: WORKERPOOL_ADDRESS,
      category: 3,
      workerpoolMaxPrice: 1000000000,
      appMaxPrice: 1000000000,
      path: "result.json",
      onStatusUpdate: (status) => {
        console.log(`[TEE] Status Update:`, status);
        if (onStatusUpdate) onStatusUpdate(status);
      }
    });
    console.log('[Engine] Process Data Result:', result);
    return { taskId: result.taskId, dealId: result.dealId };
  }, [dataProtectorCore]);

  const fetchResult = useCallback(async (taskId: string): Promise<CreditScoreResult> => {
    if (!dataProtectorCore) throw new Error("DataProtector not initialized");
    console.log('[Engine] Fetching Result for task:', taskId);

    console.log('[Engine] Downloading result zip for task:', taskId);
    const { result } = await dataProtectorCore.getResultFromCompletedTask({
      taskId,
      onStatusUpdate: (status) => {
        console.log(`[TEE-Result] Status: ${status.title}`);
      }
    });

    console.log('[Engine] Unzipping result...');
    const zip = await JSZip.loadAsync(result);

    // DEBUG: List all files in zip
    const files = Object.keys(zip.files);
    console.log('[Engine] Files found in result zip:', files);

    const errorJson = await zip.file('error.json')?.async('string');
    if (errorJson) {
      console.error('[Engine] TEE execution reported error:', errorJson);
      const errorData = JSON.parse(errorJson);
      throw new Error(errorData.message || errorData.error || 'TEE execution failed');
    }

    const resultJson = await zip.file('result.json')?.async('string') || await zip.file('data/result.json')?.async('string');
    if (!resultJson) {
      throw new Error(`Output file result.json not found. Zip contains: ${files.join(', ')}`);
    }

    console.log('[Engine] Result extracted:', resultJson);
    const parsedData = JSON.parse(resultJson);

    if (parsedData.error || parsedData.status === 'FAILURE') {
      throw new Error(parsedData.error || 'TEE execution failed');
    }

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
  }, [dataProtectorCore]);

  return {
    isInitialized,
    protectData,
    grantAccess,
    processData,
    fetchResult,
    dataProtectorCore,
  };
}
