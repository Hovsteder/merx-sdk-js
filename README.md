# MERX SDK for JavaScript

### https://merx.exchange

Official JavaScript/TypeScript SDK for the MERX TRON resource exchange.

[![npm version](https://img.shields.io/npm/v/merx-sdk.svg)](https://www.npmjs.com/package/merx-sdk)
[![node](https://img.shields.io/node/v/merx-sdk.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/merx-sdk.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/merx-sdk)

---

## Install

```bash
npm install merx-sdk
```

```bash
yarn add merx-sdk
```

```bash
pnpm add merx-sdk
```

---

## Quick Start

### Check current energy prices

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: 'your-api-key' })

const prices = await merx.prices.list()
for (const p of prices) {
  console.log(`${p.provider}: ${p.energy_prices[0]?.price_sun} SUN/energy`)
}
```

### Create an energy order

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: 'your-api-key' })

const order = await merx.orders.create({
  resource_type: 'ENERGY',
  amount: 65000,
  target_address: 'TYourTargetAddressHere',
  duration_sec: 3600,
})

console.log(`Order ${order.id} created, status: ${order.status}`)
```

### Check account balance

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: 'your-api-key' })

const balance = await merx.balance.get()
console.log(`TRX: ${balance.trx}, USDT: ${balance.usdt}`)
```

---

## Modules

### merx.prices

Methods for querying real-time energy and bandwidth prices across all providers.

#### `list()`

Returns current prices from all active providers.

```typescript
const prices: ProviderPrice[] = await merx.prices.list()
```

**Returns:** `ProviderPrice[]` -- Array of provider prices including energy and bandwidth pricing tiers, available capacity, and fetch timestamps.

---

#### `best(resource, amount?)`

Returns the single best (cheapest) price for a given resource type.

```typescript
const best: PriceHistoryEntry = await merx.prices.best('ENERGY')

// With minimum amount filter
const best = await merx.prices.best('ENERGY', 100000)
```

| Parameter  | Type           | Required | Description                          |
|------------|----------------|----------|--------------------------------------|
| `resource` | `ResourceType` | Yes      | `'ENERGY'` or `'BANDWIDTH'`         |
| `amount`   | `number`       | No       | Minimum available amount to consider |

**Returns:** `PriceHistoryEntry` -- The cheapest available price point.

---

#### `history(params?)`

Returns historical price data for analysis and charting.

```typescript
const history: PriceHistoryEntry[] = await merx.prices.history({
  provider: 'sohu',
  resource: 'ENERGY',
  period: '24h',
})
```

| Parameter  | Type           | Required | Description                                    |
|------------|----------------|----------|------------------------------------------------|
| `provider` | `string`       | No       | Filter by provider name                        |
| `resource` | `ResourceType` | No       | `'ENERGY'` or `'BANDWIDTH'`                    |
| `period`   | `string`       | No       | `'1h'`, `'6h'`, `'24h'`, `'7d'`, or `'30d'`   |

**Returns:** `PriceHistoryEntry[]` -- Array of historical price snapshots.

---

#### `stats()`

Returns aggregate price statistics across all providers.

```typescript
const stats: PriceStats = await merx.prices.stats()
console.log(`Best price: ${stats.best_price_sun} SUN`)
console.log(`Average: ${stats.avg_price_sun} SUN`)
console.log(`Providers online: ${stats.total_providers}`)
```

**Returns:** `PriceStats` -- Object with `best_price_sun`, `avg_price_sun`, `total_providers`, and `cheapest_changes_24h`.

---

#### `preview(params)`

Preview what an order would cost before placing it. Returns the best matching provider and fallback options.

```typescript
const preview: OrderPreview = await merx.prices.preview({
  resource: 'ENERGY',
  amount: 65000,
  duration: 3600,
})

if (preview.best) {
  console.log(`Best: ${preview.best.provider} at ${preview.best.cost_trx} TRX`)
}
```

| Parameter       | Type           | Required | Description                        |
|-----------------|----------------|----------|------------------------------------|
| `resource`      | `ResourceType` | Yes      | `'ENERGY'` or `'BANDWIDTH'`       |
| `amount`        | `number`       | Yes      | Amount of resource needed          |
| `duration`      | `number`       | Yes      | Duration in seconds                |
| `max_price_sun` | `number`       | No       | Maximum acceptable price per unit  |

**Returns:** `OrderPreview` -- Object with `best` (best match or null), `fallbacks` (alternative providers), and `no_providers` (boolean).

---

### merx.orders

Methods for creating and managing resource orders.

#### `create(params)`

Create a new energy or bandwidth order. The order is matched against available providers and executed automatically.

```typescript
const order: Order = await merx.orders.create({
  resource_type: 'ENERGY',
  amount: 65000,
  target_address: 'TYourTargetAddressHere',
  duration_sec: 3600,
  order_type: 'MARKET',
})
```

| Parameter        | Type           | Required | Description                                              |
|------------------|----------------|----------|----------------------------------------------------------|
| `resource_type`  | `ResourceType` | Yes      | `'ENERGY'` or `'BANDWIDTH'`                              |
| `amount`         | `number`       | Yes      | Amount of resource to purchase                           |
| `target_address` | `string`       | Yes      | TRON address to receive the delegated resource           |
| `duration_sec`   | `number`       | Yes      | Delegation duration in seconds                           |
| `order_type`     | `OrderType`    | No       | `'MARKET'` (default), `'LIMIT'`, `'PERIODIC'`, `'BROADCAST'` |
| `max_price_sun`  | `number`       | No       | Maximum price per unit (required for LIMIT orders)       |
| `idempotency_key`| `string`       | No       | Unique key to prevent duplicate orders                   |

**Returns:** `Order` -- The created order with id, status, and cost information.

---

#### `list(limit?, offset?, status?)`

List orders with pagination and optional status filter.

```typescript
const { orders, total } = await merx.orders.list(10, 0, 'FILLED')
console.log(`${total} filled orders`)
```

| Parameter | Type     | Required | Default | Description                       |
|-----------|----------|----------|---------|-----------------------------------|
| `limit`   | `number` | No       | `30`    | Number of orders to return        |
| `offset`  | `number` | No       | `0`     | Pagination offset                 |
| `status`  | `string` | No       | --      | Filter by status (e.g. `'FILLED'`)|

**Returns:** `{ orders: Order[], total: number }`

---

#### `get(id)`

Get a single order with its fill details (provider allocations and transaction IDs).

```typescript
const order: OrderWithFills = await merx.orders.get('ord_abc123')

for (const fill of order.fills) {
  console.log(`${fill.provider}: ${fill.amount} units at ${fill.price_sun} SUN`)
  if (fill.tronscan_url) console.log(`  TX: ${fill.tronscan_url}`)
}
```

| Parameter | Type     | Required | Description |
|-----------|----------|----------|-------------|
| `id`      | `string` | Yes      | Order ID    |

**Returns:** `OrderWithFills` -- Order details including an array of `Fill` objects with provider, amount, price, transaction ID, and verification status.

---

### merx.balance

Methods for managing account balance, deposits, and withdrawals.

#### `get()`

Returns current account balances.

```typescript
const balance: Balance = await merx.balance.get()
console.log(`TRX: ${balance.trx}`)
console.log(`USDT: ${balance.usdt}`)
console.log(`Locked: ${balance.trx_locked}`)
```

**Returns:** `Balance` -- Object with `trx`, `usdt`, `trx_locked`, and `updated_at`.

---

#### `depositInfo()`

Returns the deposit address and memo for funding your account.

```typescript
const info: DepositInfo = await merx.balance.depositInfo()
console.log(`Send TRX to: ${info.address}`)
console.log(`Memo: ${info.memo}`)
console.log(`Minimum TRX: ${info.min_amount_trx}`)
```

**Returns:** `DepositInfo` -- Object with `address`, `memo`, `min_amount_trx`, and `min_amount_usdt`.

---

#### `withdraw(params)`

Withdraw funds from your MERX account to an external TRON address.

```typescript
const withdrawal: Withdrawal = await merx.balance.withdraw({
  address: 'TYourExternalAddress',
  amount: 100,
  currency: 'TRX',
})
console.log(`Withdrawal ${withdrawal.id}: ${withdrawal.status}`)
```

| Parameter        | Type     | Required | Description                              |
|------------------|----------|----------|------------------------------------------|
| `address`        | `string` | Yes      | Destination TRON address                 |
| `amount`         | `number` | Yes      | Amount to withdraw                       |
| `currency`       | `string` | No       | `'TRX'` (default) or `'USDT'`           |
| `idempotency_key`| `string` | No       | Unique key to prevent duplicate requests |

**Returns:** `Withdrawal` -- Object with `id`, `status`, `amount`, `currency`, and `address`.

---

#### `history(period?)`

Returns order execution history for the specified period.

```typescript
const entries: HistoryEntry[] = await merx.balance.history('30D')
```

| Parameter | Type     | Required | Default | Description                    |
|-----------|----------|----------|---------|--------------------------------|
| `period`  | `string` | No       | `'30D'` | `'7D'`, `'30D'`, or `'90D'`   |

**Returns:** `HistoryEntry[]` -- Array of historical entries with order details, provider, amounts, prices, and transaction IDs.

---

#### `summary()`

Returns aggregate account statistics.

```typescript
const summary: HistorySummary = await merx.balance.summary()
console.log(`Total orders: ${summary.total_orders}`)
console.log(`Total energy purchased: ${summary.total_energy}`)
console.log(`Average price: ${summary.avg_price_sun} SUN`)
```

**Returns:** `HistorySummary` -- Object with `total_orders`, `total_energy`, `total_spent_sun`, and `avg_price_sun`.

---

### merx.webhooks

Methods for managing webhook subscriptions. Webhooks deliver real-time notifications when events occur on your account.

#### `create(params)`

Create a new webhook subscription.

```typescript
const webhook: Webhook = await merx.webhooks.create({
  url: 'https://your-server.com/merx-webhook',
  events: ['order.filled', 'deposit.confirmed'],
})
console.log(`Webhook ID: ${webhook.id}`)
console.log(`Secret: ${webhook.secret}`)
```

| Parameter | Type       | Required | Description                                      |
|-----------|------------|----------|--------------------------------------------------|
| `url`     | `string`   | Yes      | HTTPS URL to receive webhook payloads            |
| `events`  | `string[]` | Yes      | Event types: `order.filled`, `order.failed`, `deposit.confirmed`, `withdrawal.completed` |

**Returns:** `Webhook` -- Object with `id`, `url`, `events`, `secret` (shown once on creation), `is_active`, and `created_at`.

---

#### `list()`

List all webhook subscriptions.

```typescript
const webhooks: Webhook[] = await merx.webhooks.list()
```

**Returns:** `Webhook[]`

---

#### `delete(id)`

Delete a webhook subscription.

```typescript
const result = await merx.webhooks.delete('wh_abc123')
console.log(result.deleted) // true
```

| Parameter | Type     | Required | Description |
|-----------|----------|----------|-------------|
| `id`      | `string` | Yes      | Webhook ID  |

**Returns:** `{ deleted: boolean }`

---

## Types

All TypeScript types are exported from the package for use in your application:

```typescript
import type {
  // Client
  MerxClientOptions,

  // Prices
  ProviderPrice,
  PricePoint,
  PriceHistoryEntry,
  PriceHistoryParams,
  PriceStats,
  OrderPreview,
  PreviewMatch,
  PreviewParams,
  ResourceType,

  // Orders
  Order,
  OrderWithFills,
  Fill,
  CreateOrderParams,
  OrderType,
  OrderStatus,

  // Balance
  Balance,
  DepositInfo,
  HistoryEntry,
  HistorySummary,
  WithdrawParams,
  Withdrawal,

  // Webhooks
  Webhook,
  WebhookParams,

  // Errors
  ApiError,
  ApiResponse,
} from 'merx-sdk'
```

---

## Error Handling

All API errors are thrown as `MerxError` instances with a machine-readable `code` and a human-readable `message`.

```typescript
import { MerxClient, MerxError } from 'merx-sdk'

const merx = new MerxClient({ apiKey: 'your-api-key' })

try {
  await merx.orders.create({
    resource_type: 'ENERGY',
    amount: 65000,
    target_address: 'TInvalidAddress',
    duration_sec: 3600,
  })
} catch (err) {
  if (err instanceof MerxError) {
    console.error(`MERX error [${err.code}]: ${err.message}`)
    // Example: MERX error [INVALID_ADDRESS]: Target address is not a valid TRON address
  }
}
```

### Common error codes

| Code                  | Description                                        |
|-----------------------|----------------------------------------------------|
| `UNAUTHORIZED`        | Invalid or missing API key                         |
| `INSUFFICIENT_FUNDS`  | Account balance too low for the requested operation|
| `INVALID_ADDRESS`     | Target address is not a valid TRON address         |
| `ORDER_NOT_FOUND`     | Order ID does not exist                            |
| `INVALID_AMOUNT`      | Amount is below the minimum or exceeds limits      |
| `DUPLICATE_REQUEST`   | Idempotency key was already used                   |
| `RATE_LIMITED`        | Too many requests, try again later                 |
| `PROVIDER_UNAVAILABLE`| No providers available for the requested resource  |

---

## Examples

### 1. Get cheapest energy price

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: process.env.MERX_API_KEY! })

const best = await merx.prices.best('ENERGY')
console.log(`Cheapest energy: ${best.price_sun} SUN from ${best.provider}`)
```

### 2. Create energy order with idempotency

```typescript
import { MerxClient } from 'merx-sdk'
import { randomUUID } from 'node:crypto'

const merx = new MerxClient({ apiKey: process.env.MERX_API_KEY! })

const order = await merx.orders.create({
  resource_type: 'ENERGY',
  amount: 65000,
  target_address: 'TTargetAddress',
  duration_sec: 3600,
  idempotency_key: randomUUID(),
})

// Poll until filled
const filled = await merx.orders.get(order.id)
console.log(`Status: ${filled.status}, fills: ${filled.fills.length}`)
```

### 3. Preview order cost before placing

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: process.env.MERX_API_KEY! })

const preview = await merx.prices.preview({
  resource: 'ENERGY',
  amount: 100000,
  duration: 86400,
})

if (preview.best) {
  console.log(`Best offer: ${preview.best.provider}`)
  console.log(`Cost: ${preview.best.cost_trx} TRX`)
  console.log(`Price: ${preview.best.price_sun} SUN/unit`)
} else {
  console.log('No providers available for this request')
}

if (preview.fallbacks.length > 0) {
  console.log(`\n${preview.fallbacks.length} alternative providers:`)
  for (const fb of preview.fallbacks) {
    console.log(`  ${fb.provider}: ${fb.cost_trx} TRX`)
  }
}
```

### 4. Account balance and history

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: process.env.MERX_API_KEY! })

const balance = await merx.balance.get()
console.log(`Balance: ${balance.trx} TRX / ${balance.usdt} USDT`)

const summary = await merx.balance.summary()
console.log(`Total orders: ${summary.total_orders}`)
console.log(`Total energy: ${summary.total_energy}`)
console.log(`Avg price: ${summary.avg_price_sun} SUN`)

const history = await merx.balance.history('7D')
console.log(`\nLast 7 days: ${history.length} transactions`)
```

### 5. Set up webhooks

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({ apiKey: process.env.MERX_API_KEY! })

// Create webhook
const webhook = await merx.webhooks.create({
  url: 'https://your-server.com/api/merx-events',
  events: ['order.filled', 'order.failed', 'deposit.confirmed'],
})

console.log(`Webhook created: ${webhook.id}`)
console.log(`Signing secret: ${webhook.secret}`)

// List all webhooks
const all = await merx.webhooks.list()
console.log(`Active webhooks: ${all.filter(w => w.is_active).length}`)

// Delete webhook
await merx.webhooks.delete(webhook.id)
```

---

## Configuration

```typescript
import { MerxClient } from 'merx-sdk'

const merx = new MerxClient({
  apiKey: 'your-api-key',       // Required. Obtain from merx.exchange dashboard.
  baseUrl: 'https://merx.exchange',  // Optional. Defaults to https://merx.exchange
})
```

| Option    | Type     | Required | Default                    | Description            |
|-----------|----------|----------|----------------------------|------------------------|
| `apiKey`  | `string` | Yes      | --                         | Your MERX API key      |
| `baseUrl` | `string` | No       | `https://merx.exchange`    | API base URL           |

---

## Requirements

- **Node.js 18+** -- uses native `fetch` (no polyfill needed)
- **Zero dependencies** -- the SDK has no runtime dependencies
- **Full TypeScript support** -- all types exported, strict mode compatible
- **ESM only** -- ships as ES modules with `.d.ts` declarations and source maps

---

## Links

- **MERX Platform:** https://merx.exchange
- **API Documentation:** https://merx.exchange/docs
- **Python SDK:** `pip install merx-sdk` -- [PyPI](https://pypi.org/project/merx-sdk/)
- **MCP Server:** `npm install merx-mcp` -- for AI agent integrations
- **GitHub:** https://github.com/Hovsteder/merx-sdk-js

---

## License

MIT -- see [LICENSE](./LICENSE) for details.
