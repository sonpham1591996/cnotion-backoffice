import envConfigs from '../config/config'

const Agenda = require('agenda')

export type JobAction =
  | 'GET_BALANCE_BY_ADDRESS'
  | 'GET_HISTORICAL_PORTFOLIO_BY_ADDRESS'
  | 'GET_TRANSACTIONS_BY_ADDRESS'
  | 'GET_TRANSACTION_DETAIL'

export enum JobTypeEnum {
  EVERY,
  NOW,
  SCHEDULER,
}

const jobQueue = new Agenda({
  db: {
    address: envConfigs.getValue('MONGODB_URL'),
    collection: 'agendaJobs',
  },
})
/**
 *
 *
 * @param {JobAction} action
 * @param {*} payload
 * @param {JobTypeEnum} jobType
 * @param {string} [crontab]
 * @param {string} [timezone]
 * @return {*}
 */
export const createJob = async (
  action: JobAction,
  payload: any,
  jobType: JobTypeEnum,
  crontab?: string,
  timezone?: string
) => {
  switch (jobType) {
    case JobTypeEnum.NOW:
      return await jobQueue.now(action, payload)
    case JobTypeEnum.EVERY:
      if (!crontab) throw new Error('Invalid crontab')
      return await jobQueue.every(crontab, action, payload, timezone ? { timezone } : undefined)
    case JobTypeEnum.SCHEDULER:
      if (!crontab) throw new Error('Invalid crontab')
      return await jobQueue.schedule(crontab, action, payload)
    default:
      throw new Error('Invalid jobType')
  }
}
