import { HttpClient } from './client.js'
import { BalanceModule } from './balance.js'
import { OrdersModule } from './orders.js'
import { PricesModule } from './prices.js'
import { WebhooksModule } from './webhooks.js'
import type { MerxClientOptions } from './types.js'

export { MerxError } from './client.js'
export type * from './types.js'

export class MerxClient {
  public readonly prices:   PricesModule
  public readonly balance:  BalanceModule
  public readonly orders:   OrdersModule
  public readonly webhooks: WebhooksModule

  constructor(options: MerxClientOptions) {
    const http = new HttpClient(options)
    this.prices   = new PricesModule(http)
    this.balance  = new BalanceModule(http)
    this.orders   = new OrdersModule(http)
    this.webhooks = new WebhooksModule(http)
  }
}
