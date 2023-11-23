import logger from '../config/logger'
import { PROVIDER_ENUM } from '../enums'
import { BalancesTokenLogsModel } from '../models/balances-token.model'
import { createJob, JobTypeEnum } from '../workers/job-handler'
import { GET_BALANCE_BY_ADDRESS_JOB_DATA } from '../workers/jobs/balance-token-jobs'
import { NETWORK_ENUM } from './../enums'
import { AgendaJobService } from './agenda-job.service'
import covalentProvider from './providers/covalent'
import { RedisService } from './redis.service'

export class BalancesTokenService {
  private static _instance: BalancesTokenService

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new BalancesTokenService()
    return this._instance
  }
  /**
   *
   *
   * @param {GET_BALANCE_BY_ADDRESS_JOB_DATA} job_data
   * @return {*}
   * @memberof BalancesTokenService
   */
  async handleBalanceTokensJob(job_data: GET_BALANCE_BY_ADDRESS_JOB_DATA) {
    try {
      switch (job_data.provider) {
        case PROVIDER_ENUM.COVALENT:
          const data = await covalentProvider.getBalances(job_data.network_id, job_data.public_key)
          await this.storeBalanceTokenData(data, job_data.provider)
          return
        default:
          throw new Error('Invalid provider')
      }
    } catch (error) {
      logger.error('ERROR', JSON.stringify(error))
    }
  }
  /**
   *
   *
   * @param {string} public_key
   * @return {*}
   * @memberof BalancesTokenService
   */
  async getBalanceTokenForUser(public_key: string) {
    const cached_key = `balance_token_${NETWORK_ENUM.BSC}_${public_key.toLowerCase()}`
    let balance_token_data

    const cacheData = await RedisService.getInstance().redisClient.get(cached_key)

    balance_token_data = cacheData ? JSON.parse(cacheData) : null
    if (balance_token_data) {
      logger.info('Load Balance token from caching')
    } else {
      const balanceTokenJob = await AgendaJobService.getInstance().getJob(
        'GET_BALANCE_BY_ADDRESS',
        public_key.toLowerCase()
      )
      if (!balanceTokenJob) {
        // Create job to get balance token from public_key
        await createJob(
          'GET_BALANCE_BY_ADDRESS',
          { provider: PROVIDER_ENUM.COVALENT, network_id: NETWORK_ENUM.BSC, public_key: public_key.toLowerCase() },
          JobTypeEnum.NOW
        )
      }
      // Balance Token
      logger.info('Balance token from caching has expired time')
      balance_token_data = await BalancesTokenLogsModel.findOne({
        chain_id: NETWORK_ENUM.BSC,
        public_key: public_key.toLowerCase(),
      })
    }
    if (!balance_token_data) return { total_balance: 0, assets: [] }

    await RedisService.getInstance().setEx(cached_key, 300, JSON.stringify(balance_token_data)) // 5 minutes

    const total_balance: number =
      balance_token_data?.items?.length > 0
        ? +parseFloat(
            `${Array.from(balance_token_data.items ?? []).reduce((total: number, item: any) => {
              total += parseFloat(item.quote?.toFixed(7))
              return total
            }, 0)}`
          ).toFixed(7)
        : 0
    const assets =
      balance_token_data?.items?.length > 0
        ? balance_token_data.items
            .filter((item) => item.quote > 0)
            .map((item: any) => {
              return {
                token_name: item.contract_name,
                logo_url: item.logo_url,
                symbol: item.contract_ticker_symbol,
                price: item.quote_rate.toFixed(7),
                balance: parseFloat((item.balance / Math.pow(10, item.contract_decimals ?? 18)).toFixed(7)),
                quote: item.quote.toFixed(7),
                quote_24h: item.quote_24h?.toFixed(7) ?? 0,
                market_cap: 0,
                pie_chart_percentage: ((item.quote / total_balance) * 100).toFixed(2),
              }
            })
        : []

    return { total_balance, assets }
  }

  /**
   *
   *
   * @private
   * @param {*} data
   * @param {'COVALENT'} provider
   * @memberof BalancesTokenService
   */
  private async storeBalanceTokenData(data: any, provider: PROVIDER_ENUM) {
    let balanceTokenLog = await BalancesTokenLogsModel.findOne({
      public_key: data.public_key,
      chain_id: data.chain_id,
    })
    if (!balanceTokenLog) {
      balanceTokenLog = new BalancesTokenLogsModel()
      balanceTokenLog.public_key = data.public_key
      balanceTokenLog.quote_currency = data.quote_currency
      balanceTokenLog.chain_id = data.chain_id
      balanceTokenLog.provider = provider
    }
    balanceTokenLog.items = []
    balanceTokenLog = await balanceTokenLog.save()
    const MAX_CHUNK_SIZE = 20
    if ((data.items?.length ?? 0) > 0) {
      for (let i = 0; i < data.items.length; i += MAX_CHUNK_SIZE) {
        const chunk = data.items.slice(i, i + MAX_CHUNK_SIZE)
        balanceTokenLog.items.push(...chunk)
        balanceTokenLog = await balanceTokenLog.save()
      }
    }
    logger.info('Store balances token logs successfully')
  }
}
