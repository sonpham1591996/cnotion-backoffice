import { Document, model, Model, Schema } from 'mongoose'

export interface CovalentHistoricalPortfolioItems {
  portfolio_log_id: string
  contract_decimals: number
  contract_name: string
  contract_ticker_symbol: string
  contract_address: string
  supports_erc: any
  logo_url: string
  holdings: any
}

export interface CovalentHistoricalPortfolioItemsDocument extends CovalentHistoricalPortfolioItems, Document {
  _id: string | Schema.Types.ObjectId
}

export interface ICovalentHistoricalPortfolioItemsModel extends Model<CovalentHistoricalPortfolioItemsDocument> {}

export const covalentHistoricalPortfolioItemsSchema: Schema<
  CovalentHistoricalPortfolioItemsDocument,
  ICovalentHistoricalPortfolioItemsModel
> = new Schema<CovalentHistoricalPortfolioItemsDocument, ICovalentHistoricalPortfolioItemsModel>({
  portfolio_log_id: {
    type: String,
    required: true,
  },
  contract_decimals: {
    type: Number,
    required: true,
  },
  contract_name: {
    type: String,
    required: true,
  },
  contract_ticker_symbol: {
    type: String,
    required: true,
  },
  contract_address: {
    type: String,
    required: true,
  },
  supports_erc: {
    type: Array<any>,
  },
  logo_url: {
    type: String,
    required: true,
  },
  holdings: {
    type: String,
    required: true,
  },
})

export const CovalentHistoricalPortfolioItemsModel = model<
  CovalentHistoricalPortfolioItemsDocument,
  ICovalentHistoricalPortfolioItemsModel
>('Covalent_Historical_Portfolio_Items', covalentHistoricalPortfolioItemsSchema, 'covalent_historical_portfolio_items')
