import Agenda, { Job } from 'agenda'
import logger from '../../config/logger'
import { PROVIDER_ENUM } from '../../enums'
import { HistoricalPortfolioService } from '../../services/historical-portfolio.service'
import { CONCURRENT_JOB_CONFIGS } from '../job-configs'

export type GET_HISTORICAL_PORTFOLIO_BY_ADDRESS_JOB_DATA = {
  provider: PROVIDER_ENUM
  network_id: number
  public_key: string
}

export default (agenda: Agenda) => {
  agenda.define(
    'GET_HISTORICAL_PORTFOLIO_BY_ADDRESS',
    {
      concurrency: CONCURRENT_JOB_CONFIGS.getFromCovalent,
    },
    async (job: Job<GET_HISTORICAL_PORTFOLIO_BY_ADDRESS_JOB_DATA>, done) => {
      logger.info('START JOB GET_HISTORICAL_PORTFOLIO_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      await HistoricalPortfolioService.getInstance().handleHistoricalPortfolioJob(job.attrs.data!)
      logger.info('FINISHED JOB GET_HISTORICAL_PORTFOLIO_BY_ADDRESS ON NETWORK ' + job?.attrs?.data?.network_id)
      done()
    }
  )
}
