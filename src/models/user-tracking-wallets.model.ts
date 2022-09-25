import { Document, model, Model, Schema } from 'mongoose'

export interface UserTrackingWallets {
  user_wallet_address: string
  tracking_wallet_address: string
  alias: string
  notes: string
  created_ts: number
  updated_ts: number
}

export interface UserTrackingWalletsDocument extends UserTrackingWallets, Document {
  _id: string | Schema.Types.ObjectId
}

export interface IUserTrackingWalletsModel extends Model<UserTrackingWalletsDocument> {}

export const userTrackingWalletsSchema: Schema<UserTrackingWalletsDocument, IUserTrackingWalletsModel> = new Schema<
  UserTrackingWalletsDocument,
  IUserTrackingWalletsModel
>(
  {
    user_wallet_address: { type: String, required: true, index: true, trim: true },
    tracking_wallet_address: { type: String, required: true, index: true },
    alias: { type: String, required: true, index: true },
    notes: { type: String },
    created_ts: { type: Number, default: Date.now },
    updated_ts: { type: Number, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_ts', updatedAt: 'updated_ts' },
    validateBeforeSave: true,
  }
)

export const UserTrackingWalletsModel = model<UserTrackingWalletsDocument, IUserTrackingWalletsModel>(
  'User_Tracking_Wallets',
  userTrackingWalletsSchema,
  'user_tracking_wallets'
)
