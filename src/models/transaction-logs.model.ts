import { Document, model, Model, Schema } from 'mongoose'

export interface TransactionLogs {
  public_key: string
  quote_currency: string
  chain_id: number
  block_signed_at: string
  block_height: number
  tx_hash: string
  from_address: string
  to_address: string
  value: string
  value_quote: number
  gas_offered: number
  gas_spent: number
  gas_price: number
  fees_paid: string
  gas_quote: number
  gas_quote_rate: number
  log_events: any
  created_ts: number
  updated_ts: number
}

export interface TransactionLogsDocument extends TransactionLogs, Document {
  _id: string | Schema.Types.ObjectId
}

export interface ITransactionLogsDataModel extends Model<TransactionLogsDocument> {}

export const transactionLogsSchema: Schema<TransactionLogsDocument, ITransactionLogsDataModel> = new Schema<
  TransactionLogsDocument,
  ITransactionLogsDataModel
>(
  {
    public_key: {
      type: String,
      required: true,
    },
    quote_currency: {
      type: String,
      required: true,
    },
    chain_id: {
      type: Number,
      required: true,
    },
    block_signed_at: {
      type: String,
      required: true,
    },
    block_height: {
      type: Number,
      required: true,
    },
    tx_hash: {
      type: String,
      required: true,
    },
    from_address: {
      type: String,
      required: true,
    },
    to_address: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
      default: '0',
    },
    value_quote: {
      type: Number,
      required: true,
      default: 0,
    },
    gas_offered: {
      type: Number,
      default: 0,
    },
    gas_spent: {
      type: Number,
      default: 0,
    },
    gas_price: {
      type: Number,
      default: 0,
    },
    fees_paid: {
      type: String,
    },
    gas_quote: {
      type: Number,
      default: 0,
    },
    gas_quote_rate: {
      type: Number,
      default: 0,
    },
    log_events: {
      type: Array<any>,
      required: true,
    },
    created_ts: { type: Number, default: Date.now },
    updated_ts: { type: Number, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_ts', updatedAt: 'updated_ts' },
    validateBeforeSave: true,
  }
)

export const TransactionLogsModel = model<TransactionLogsDocument, ITransactionLogsDataModel>(
  'Transaction_Logs',
  transactionLogsSchema,
  'transaction_logs'
)
