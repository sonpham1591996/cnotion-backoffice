import { Document, model, Model, Schema } from 'mongoose'

export interface BalancesTokenLogs {
  public_key: string
  chain_id: number
  quote_currency: string
  provider: string
  items: any
  created_ts: number
  updated_ts: number
}

export interface BalancesTokenLogsDocument extends BalancesTokenLogs, Document {
  _id: string | Schema.Types.ObjectId
}

export interface IBalancesTokenLogsModel extends Model<BalancesTokenLogsDocument> {}

export const balancesTokenLogsSchema: Schema<BalancesTokenLogsDocument, IBalancesTokenLogsModel> = new Schema<
  BalancesTokenLogsDocument,
  IBalancesTokenLogsModel
>(
  {
    public_key: { type: String, required: true, index: true, trim: true },
    chain_id: { type: Number, required: true, index: true },
    quote_currency: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    items: {
      type: Array<{
        contract_decimals: {
          type: Number
          required: true
        }
        contract_name: {
          type: String
          required: true
        }
        contract_ticker_symbol: {
          type: String
          required: true
        }
        contract_address: {
          type: String
          required: true
        }
        supports_erc: {
          type: Array<any>
        }
        logo_url: {
          type: String
          required: true
        }
        last_transferred_at: {
          type: String
          required: true
        }
        type: {
          type: String
          required: true
        }
        balance: {
          type: String
          required: true
        }
        balance_24h: {
          type: String
          required: true
        }
        quote_rate: {
          type: Number
          required: true
        }
        quote_rate_24h: {
          type: Number
          required: true
        }
        quote: {
          type: Number
          required: true
        }
        quote_24h: {
          type: Number
          required: true
        }
        nft_data: {
          type: String
        }
      }>,
    },
    created_ts: { type: Number, default: Date.now },
    updated_ts: { type: Number, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_ts', updatedAt: 'updated_ts' },
    validateBeforeSave: true,
  }
)

export const BalancesTokenLogsModel = model<BalancesTokenLogsDocument, IBalancesTokenLogsModel>(
  'Balances_Token_Logs',
  balancesTokenLogsSchema,
  'balance_token_logs'
)
