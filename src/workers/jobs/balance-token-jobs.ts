import { PROVIDER_ENUM } from './../../enums/index'
import Agenda, { Job } from 'agenda'
import { CONCURRENT_JOB_CONFIGS } from '../job-configs'
import logger from '../../config/logger'
import { BalancesTokenService } from '../../services/balances-token.service'

export type GET_BALANCE_BY_ADDRESS_JOB_DATA = {
  provider: PROVIDER_ENUM
  network_id: number
  public_key: string
}

export default (agenda: Agenda) => {
  agenda.define(
    'GET_BALANCE_BY_ADDRESS',
    {
      concurrency: CONCURRENT_JOB_CONFIGS.getFromCovalent,
    },
    async (job: Job<GET_BALANCE_BY_ADDRESS_JOB_DATA>, done) => {
      logger.info('START JOB GET_BALANCE_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      await BalancesTokenService.getInstance().handleBalanceTokensJob(job.attrs.data!)
      logger.info('FINISHED JOB GET_BALANCE_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      done()
    }
  )
}
