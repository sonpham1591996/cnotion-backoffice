import { HistoricalPortfolioService } from './historical-portfolio.service'
import { BalancesTokenService } from './balances-token.service'
import { AgendaJobService } from './agenda-job.service'
import logger from '../config/logger'
import { createJob, JobTypeEnum } from '../workers/job-handler'
import { NETWORK_ENUM, PROVIDER_ENUM } from '../enums'
import { TransactionLogsModel } from '../models/transaction-logs.model'
export class PortfolioService {
  private static _instance: PortfolioService

  private constructor() {}

  static getInstance(): PortfolioService {
    if (!this._instance) {
      this._instance = new PortfolioService()
    }
    return this._instance
  }

  async getPortfolioData(public_key: string, filtered_time: string) {
    try {
      const balanceTokenData = await BalancesTokenService.getInstance().getBalanceTokenForUser(public_key)
      const historicalPortfolioData = await HistoricalPortfolioService.getInstance().getHistoricalPortfolio(
        public_key,
        filtered_time ?? '7d'
      )
      // Transactions
      const transactionJob = await AgendaJobService.getInstance().getJob('GET_TRANSACTIONS_BY_ADDRESS', public_key)
      if (!transactionJob) {
        logger.info('Create get transactions by address: ' + public_key)
        const transactionLogs = await TransactionLogsModel.findOne({
          public_key,
        })
        createJob(
          'GET_TRANSACTIONS_BY_ADDRESS',
          {
            provider: PROVIDER_ENUM.COVALENT,
            network_id: NETWORK_ENUM.BSC,
            public_key,
          },
          JobTypeEnum.SCHEDULER,
          transactionLogs ? 'in 2 minutes' : 'in 10 seconds'
        )
      }

      return {
        total_balance: balanceTokenData.total_balance,
        assets: balanceTokenData.assets,
        chart_data: historicalPortfolioData,
      }
    } catch (error) {
      console.error(error);
      throw new Error('Server internal error, please try again.')
    }
  }
}
