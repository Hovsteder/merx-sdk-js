export interface MerxClientOptions {
  apiKey: string
  baseUrl?: string
}

export interface PricePoint {
  duration_sec: number
  price_sun: number
}

export interface ProviderPrice {
  provider: string
  is_market: boolean
  energy_prices: PricePoint[]
  bandwidth_prices: PricePoint[]
  available_energy: number
  available_bandwidth: number
  fetched_at: number
}

export interface Balance {
  trx: number
  usdt: number
  trx_locked: number
  updated_at?: string
}

export type OrderType = 'MARKET' | 'LIMIT' | 'PERIODIC' | 'BROADCAST'
export type OrderStatus = 'PENDING' | 'EXECUTING' | 'PARTIALLY_FILLED' | 'FILLED' | 'FAILED' | 'CANCELLED'
export type ResourceType = 'ENERGY' | 'BANDWIDTH'

export interface CreateOrderParams {
  resource_type: ResourceType
  order_type?: OrderType
  amount: number
  target_address: string
  duration_sec: number
  max_price_sun?: number
  idempotency_key?: string
}

export interface Order {
  id: string
  resource_type: ResourceType
  order_type: OrderType
  status: OrderStatus
  amount: number
  target_address: string
  duration_sec: number
  total_cost_sun: number | null
  total_fee_sun: number | null
  created_at: string
  filled_at: string | null
  expires_at: string | null
}

export interface Fill {
  provider: string
  amount: number
  price_sun: number
  cost_sun: number
  tx_id: string | null
  status: string
  delegation_tx: string | null
  verified: boolean
  tronscan_url: string | null
}

export interface OrderWithFills extends Order {
  fills: Fill[]
}

export interface HistoryEntry {
  id: string
  order_id: string
  provider: string
  amount: number
  price_sun: number
  cost_sun: number
  tx_id: string | null
  created_at: string
  confirmed_at: string | null
  resource_type: ResourceType
}

export interface HistorySummary {
  total_orders: number
  total_energy: number
  total_spent_sun: number
  avg_price_sun: number
}

export interface DepositInfo {
  address: string
  memo: string
  min_amount_trx: number
  min_amount_usdt: number
}

export interface WithdrawParams {
  address: string
  amount: number
  currency?: 'TRX' | 'USDT'
  idempotency_key?: string
}

export interface Withdrawal {
  id: string
  status: string
  amount: number
  currency: string
  address: string
}

export interface PreviewParams {
  resource: ResourceType
  amount: number
  duration: number
  max_price_sun?: number
}

export interface PreviewMatch {
  provider: string
  displayName: string
  price_sun: number
  cost_trx: string
  duration_sec: number
}

export interface OrderPreview {
  best: PreviewMatch | null
  fallbacks: PreviewMatch[]
  no_providers: boolean
}

export interface PriceStats {
  cheapest_changes_24h: number
  total_providers: number
  best_price_sun: number
  avg_price_sun: number
}

export interface PriceHistoryEntry {
  provider: string
  resource_type: ResourceType
  price_sun: number
  available: number
  is_online: boolean
  polled_at: string
}

export interface PriceHistoryParams {
  provider?: string
  resource?: ResourceType
  period?: '1h' | '6h' | '24h' | '7d' | '30d'
}

export interface WebhookParams {
  url: string
  events: string[]
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  secret?: string
  is_active: boolean
  created_at: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}
