import type { HttpClient } from './client.js'
import type {
  ProviderPrice, PriceHistoryEntry, PriceHistoryParams,
  PriceStats, OrderPreview, PreviewParams, ResourceType,
} from './types.js'

export class PricesModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<ProviderPrice[]> {
    return this.http.get<ProviderPrice[]>('/api/v1/prices')
  }

  async best(resource: ResourceType, amount?: number): Promise<PriceHistoryEntry> {
    const params = new URLSearchParams({ resource })
    if (amount) params.set('amount', String(amount))
    return this.http.get<PriceHistoryEntry>(`/api/v1/prices/best?${params}`)
  }

  async history(params?: PriceHistoryParams): Promise<PriceHistoryEntry[]> {
    const qs = new URLSearchParams()
    if (params?.provider) qs.set('provider', params.provider)
    if (params?.resource) qs.set('resource', params.resource)
    if (params?.period) qs.set('period', params.period)
    return this.http.get<PriceHistoryEntry[]>(`/api/v1/prices/history?${qs}`)
  }

  async stats(): Promise<PriceStats> {
    return this.http.get<PriceStats>('/api/v1/prices/stats')
  }

  async preview(params: PreviewParams): Promise<OrderPreview> {
    const qs = new URLSearchParams({
      resource: params.resource,
      amount: String(params.amount),
      duration: String(params.duration),
    })
    if (params.max_price_sun) qs.set('max_price_sun', String(params.max_price_sun))
    return this.http.get<OrderPreview>(`/api/v1/orders/preview?${qs}`)
  }
}
