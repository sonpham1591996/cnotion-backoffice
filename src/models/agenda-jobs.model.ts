import { Document, model, Model, Schema } from 'mongoose'

export interface AgendaJobs {
  name: string
  data: object
  priority: number
  type: string
  nextRunAt: Date
  lastModifiedBy: string
  lockedAt: Date
  failCount: number
  failReason: string
  failedAt: Date
  lastFinishedAt: Date
}

export interface AgendaJobsDocument extends AgendaJobs, Document {
  _id: string | Schema.Types.ObjectId
}

export interface IAgendaJobsDataModel extends Model<AgendaJobsDocument> {}

export const agendaJobSchema: Schema<AgendaJobsDocument, IAgendaJobsDataModel> = new Schema<
  AgendaJobsDocument,
  IAgendaJobsDataModel
>(
  {
    name: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    priority: {
      type: Number,
    },
    type: { type: String },
    nextRunAt: {
      type: Date,
    },
    lastModifiedBy: { type: String },
    lockedAt: {
      type: Date,
    },
    failCount: {
      type: Number,
    },
    failReason: {
      type: String,
    },
    failedAt: {
      type: Date,
    },
    lastFinishedAt: {
      type: Date,
    },
  },
  {
    validateBeforeSave: true,
  }
)

export const AgendaJobModel = model<AgendaJobsDocument, IAgendaJobsDataModel>(
  'Agenda_Jobs',
  agendaJobSchema,
  'agendaJobs'
)
