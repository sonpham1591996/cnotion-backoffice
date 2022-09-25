import { Document, model, Model, Schema } from 'mongoose'

export interface CovalentHistoricalPortfolioLogs {
  public_key: string
  updated_at: string
  chain_id: number
  quote_currency: string
  provider: string
  items: any
  created_ts: number
  updated_ts: number
}

export interface CovalentHistoricalPortfolioLogsDocument extends CovalentHistoricalPortfolioLogs, Document {
  _id: string | Schema.Types.ObjectId
}

export interface ICovalentHistoricalPortfolioLogsModel extends Model<CovalentHistoricalPortfolioLogsDocument> {}

export const covalentHistoricalPortfolioLogsSchema: Schema<
  CovalentHistoricalPortfolioLogsDocument,
  ICovalentHistoricalPortfolioLogsModel
> = new Schema<CovalentHistoricalPortfolioLogsDocument, ICovalentHistoricalPortfolioLogsModel>(
  {
    public_key: { type: String, required: true, index: true, trim: true },
    updated_at: { type: String, required: true, index: true },
    chain_id: { type: Number, required: true, index: true },
    quote_currency: { type: String, required: true, index: true },
    provider: { type: String, required: true, index: true },
    items: {
      type: Array,
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

export const CovalentHistoricalPortfolioLogsModel = model<
  CovalentHistoricalPortfolioLogsDocument,
  ICovalentHistoricalPortfolioLogsModel
>('Covalent_Historical_Portfolio_Logs', covalentHistoricalPortfolioLogsSchema, 'covalent_historical_portfolio_logs')
