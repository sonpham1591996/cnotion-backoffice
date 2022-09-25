import { Document, model, Model, Schema } from 'mongoose';

export interface Users {
  nonce: string;
  address: string;
  updated_ts: number;
  created_ts: number;
}

export interface UsersDocument extends Users, Document {
  _id: string | Schema.Types.ObjectId;
}

export interface IUsersModel extends Model<UsersDocument> {}

export const usersSchema: Schema<UsersDocument, IUsersModel> = new Schema<UsersDocument, IUsersModel>(
  {
    nonce: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    created_ts: { type: Number, default: Date.now },
    updated_ts: { type: Number, default: Date.now }
  },
  {
    timestamps: { createdAt: 'created_ts', updatedAt: 'updated_ts' },
    validateBeforeSave: true
  }
);

export const UsersModel = model<UsersDocument, IUsersModel>('Users', usersSchema);
