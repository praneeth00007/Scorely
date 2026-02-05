export interface FinancialRecord {
  record_id: string;
  type: string;
  source: string;
  value: number;
  timestamp: number;
  user_address: string;
}

/**
 * Sample financial records for testing the Scorely Credit Scoring
 */
export const SAMPLE_FINANCIAL_RECORDS: FinancialRecord[] = [
  {
    record_id: "rec_01",
    type: "Salary",
    source: "Employer A",
    value: 4500,
    timestamp: 1715082000,
    user_address: "0x..."
  },
  {
    record_id: "rec_02",
    type: "DeFi Yield",
    source: "Aave",
    value: 1200,
    timestamp: 1715082010,
    user_address: "0x..."
  },
  {
    record_id: "rec_03",
    type: "Digital Asset",
    source: "Uniswap LP",
    value: 8500,
    timestamp: 1715082020,
    user_address: "0x..."
  },
  {
    record_id: "rec_04",
    type: "Credit Spending",
    source: "Merchant X",
    value: -1500,
    timestamp: 1715082030,
    user_address: "0x..."
  }
];

export interface CreditScoringResult {
  score: number;
  grade: string;
  factors: string[];
  timestamp: number;
  taskId: string;
}

export const MOCK_SCORING_RESULT: CreditScoringResult = {
  score: 814,
  grade: "A+",
  factors: ["High liquidity", "Low debt-to-income", "Consistent DeFi activity"],
  timestamp: Date.now(),
  taskId: "0x...abc"
};
