import { TransactionLogsService } from './../../services/transaction-logs.service'
import { PROVIDER_ENUM } from './../../enums/index'
import Agenda, { Job } from 'agenda'
import { CONCURRENT_JOB_CONFIGS } from '../job-configs'
import logger from '../../config/logger'

export type GET_TRANSACTIONS_BY_ADDRESS_JOB_DATA = {
  provider: PROVIDER_ENUM
  network_id: number
  public_key: string
  action_log_id?: string
}

export type GET_TRANSACTION_DETAIL_JOB_DATA = {
  provider: PROVIDER_ENUM
  network_id: number
  tx_hash: string
  data_id?: string
}

export default (agenda: Agenda) => {
  agenda.define(
    'GET_TRANSACTIONS_BY_ADDRESS',
    {
      concurrency: CONCURRENT_JOB_CONFIGS.getFromCovalent,
    },
    async (job: Job<GET_TRANSACTIONS_BY_ADDRESS_JOB_DATA>, done) => {
      logger.info('START JOB GET_TRANSACTIONS_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      await TransactionLogsService.getInstance().getTransactions(job.attrs.data!)
      logger.info('FINISHED JOB GET_TRANSACTIONS_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      done()
    }
  )

  agenda.define(
    'GET_TRANSACTION_DETAIL',
    {
      concurrency: CONCURRENT_JOB_CONFIGS.getFromCovalent,
    },
    async (job: Job<GET_TRANSACTION_DETAIL_JOB_DATA>, done) => {
      logger.info('START JOB GET_TRANSACTION_DETAIL ON NETWORK ' + job?.attrs?.data?.network_id)
      await TransactionLogsService.getInstance().getTransactionDetail(job.attrs.data!)
      logger.info('FINISHED JOB GET_TRANSACTION_DETAIL ' + job?.attrs?.data?.network_id)
      done()
    }
  )
}
