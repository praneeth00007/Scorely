/// <reference types="vite/client" />

// Environment variables
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Ethereum provider types
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
  isMetaMask?: boolean
}

interface Window {
  ethereum?: EthereumProvider
}

// Backend API types
interface BackendStatus {
  status: string
  backend: string
  network: number
  blockNumber: number
  balance: string
  teeMode: 'REAL' | 'MOCKED'
  contracts: {
    oracle: string
    nft: string
  }
}

interface TaskStatus {
  taskId: string
  status: 'pending' | 'completed' | 'failed' | 'error'
  result?: ComputationResult
  message?: string
  timestamp?: number
  submitter?: string
  teeMode?: 'REAL' | 'MOCKED'
}

interface ComputationResult {
  symbol: string
  aggregatedPrice: number
  sources: Array<{
    source: string
    price: number
    timestamp: number
  }>
  resultHash: string
  computedAt: number
  confidential: boolean
}

interface NFTMintResponse {
  success: boolean
  tokenId: string | null
  txHash: string
  message: string
}

interface NFTVerifyResponse {
  address: string
  hasSupport: boolean
  totalSupporters: string
}
