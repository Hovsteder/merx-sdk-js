import type { HttpClient } from './client.js'
import type {
  Balance, DepositInfo, HistoryEntry, HistorySummary,
  WithdrawParams, Withdrawal,
} from './types.js'

export class BalanceModule {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<Balance> {
    return this.http.get<Balance>('/api/v1/balance')
  }

  async depositInfo(): Promise<DepositInfo> {
    return this.http.get<DepositInfo>('/api/v1/deposit/info')
  }

  async withdraw(params: WithdrawParams): Promise<Withdrawal> {
    const { idempotency_key, ...body } = params
    const headers: Record<string, string> = {}
    if (idempotency_key) headers['Idempotency-Key'] = idempotency_key
    return this.http.post<Withdrawal>('/api/v1/withdraw', body, headers)
  }

  async history(period: '7D' | '30D' | '90D' = '30D'): Promise<HistoryEntry[]> {
    return this.http.get<HistoryEntry[]>(`/api/v1/history?period=${period}`)
  }

  async summary(): Promise<HistorySummary> {
    return this.http.get<HistorySummary>('/api/v1/history/summary')
  }
}
