import * as _ from 'underscore'
import logger from '../config/logger'
import { NETWORK_ENUM, PROVIDER_ENUM } from '../enums'
import { GET_HISTORICAL_PORTFOLIO_BY_ADDRESS_JOB_DATA } from '../workers/jobs/historical-portfolio-jobs'
import { CovalentHistoricalPortfolioItemsModel } from './../models/covalent-historical-portfolio-items.model'
import { CovalentHistoricalPortfolioLogsModel } from './../models/covalent-historical-portfolio-logs.model'
import { createJob, JobTypeEnum } from './../workers/job-handler'
import { AgendaJobService } from './agenda-job.service'
import covalentProvider from './providers/covalent'
import { RedisService } from './redis.service'

export class HistoricalPortfolioService {
  private static _instance: HistoricalPortfolioService

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new HistoricalPortfolioService()
    return this._instance
  }
  /**
   *
   *
   * @param {GET_HISTORICAL_PORTFOLIO_BY_ADDRESS_JOB_DATA} job_data
   * @return {*}
   * @memberof HistoricalPortfolioService
   */
  async handleHistoricalPortfolioJob(job_data: GET_HISTORICAL_PORTFOLIO_BY_ADDRESS_JOB_DATA) {
    switch (job_data.provider) {
      case PROVIDER_ENUM.COVALENT:
        const data = await covalentProvider.getHistoricalPortfolio(job_data.network_id, job_data.public_key)
        await this.storeHistoricalPortfolioData(data, job_data.provider)
        return
      default:
        throw new Error('Invalid provider')
    }
  }
  /**
   *
   *
   * @param {string} public_key
   * @param {number} total_balance
   * @return {*}
   * @memberof HistoricalPortfolioService
   */
  async getHistoricalPortfolio(public_key: string, filtered_time: string) {
    const cache_key = `user_portfolio_${NETWORK_ENUM.BSC}_${public_key}_${filtered_time}`
    const cacheData = await RedisService.getInstance().redisClient.get(cache_key)

    let chart_data: Array<{ timestamp: string; value: number }> = cacheData ? JSON.parse(cacheData) : null
    if (chart_data) {
      logger.info('Load Historical Portfolio from caching')
      return chart_data
    }

    logger.info('Historical Portfolio from caching has expired time')
    // Create job to get historical portfolio from public_key
    const historicalPortfolioJob = await AgendaJobService.getInstance().getJob(
      'GET_HISTORICAL_PORTFOLIO_BY_ADDRESS',
      public_key
    )
    if (!historicalPortfolioJob) {
      await createJob(
        'GET_HISTORICAL_PORTFOLIO_BY_ADDRESS',
        { provider: PROVIDER_ENUM.COVALENT, network_id: NETWORK_ENUM.BSC, public_key },
        JobTypeEnum.NOW
      )
    }
    // Historical portfolio
    chart_data = await this.getUserPortfolioChartData(NETWORK_ENUM.BSC, public_key, filtered_time)

    if (!chart_data || !chart_data[chart_data.length - 1]) return null

    const latestChartData = new Date(chart_data[chart_data.length - 1].timestamp)
    const now = new Date()

    if (
      now.getUTCDay() === latestChartData.getUTCDay() &&
      now.getUTCMonth() === latestChartData.getUTCMonth() &&
      now.getFullYear() === latestChartData.getFullYear()
    ) {
      await RedisService.getInstance().setEx(cache_key, 300, JSON.stringify(chart_data)) // 5 minutes
    }
    return chart_data
  }
  /**
   *
   *
   * @private
   * @param {*} data
   * @param {'COVALENT'} provider
   * @return {*}
   * @memberof HistoricalPortfolioService
   */
  private async storeHistoricalPortfolioData(data: any, provider: PROVIDER_ENUM) {
    if (!data || (data.items?.length ?? 0) <= 0) return

    if (provider === 'COVALENT') {
      let covalentHistoricalPortfolioLogs = await CovalentHistoricalPortfolioLogsModel.findOne({
        public_key: data.public_key,
        chain_id: data.chain_id,
      })
      if (!covalentHistoricalPortfolioLogs) {
        covalentHistoricalPortfolioLogs = new CovalentHistoricalPortfolioLogsModel()
        covalentHistoricalPortfolioLogs.public_key = data.public_key
        covalentHistoricalPortfolioLogs.quote_currency = data.quote_currency
        covalentHistoricalPortfolioLogs.chain_id = data.chain_id
        covalentHistoricalPortfolioLogs.provider = provider
        covalentHistoricalPortfolioLogs.updated_at = data.updated_at

        covalentHistoricalPortfolioLogs.items = []
        covalentHistoricalPortfolioLogs = await covalentHistoricalPortfolioLogs.save()
      }

      const itemsFromProviderMap = new Map()

      data.items.forEach((item) => {
        itemsFromProviderMap.set(item.contract_address, item)
      })

      const itemsFromDB = await CovalentHistoricalPortfolioItemsModel.find({
        portfolio_log_id: covalentHistoricalPortfolioLogs._id.toString(),
        contract_address: { $in: Array.from(itemsFromProviderMap.keys()) },
      })
      const itemsFromDBMap = new Map()

      itemsFromDB.forEach((item) => itemsFromDBMap.set(item.contract_address, item))

      _.intersection(
        Array.from(itemsFromProviderMap.keys()),
        itemsFromDB.map((obj) => obj.contract_address)
      ).forEach((contract_address) => {
        itemsFromDBMap.get(contract_address).holdings = JSON.stringify(
          itemsFromProviderMap.get(contract_address).holdings
        )
      })

      for (const item of Array.from(itemsFromDBMap.values())) {
        await CovalentHistoricalPortfolioItemsModel.findByIdAndUpdate(item.id, { holdings: item.holdings })
      }

      const diffContractAddresses = _.difference(
        Array.from(itemsFromProviderMap.keys()),
        itemsFromDB.map((obj) => obj.contract_address)
      )

      let diffDoc = diffContractAddresses.map((contract_address) => {
        return {
          ...itemsFromProviderMap.get(contract_address),
          holdings: JSON.stringify(itemsFromProviderMap.get(contract_address).holdings),
          portfolio_log_id: covalentHistoricalPortfolioLogs?._id.toString(),
        }
      })

      diffDoc = await CovalentHistoricalPortfolioItemsModel.insertMany(diffDoc, { ordered: false })

      covalentHistoricalPortfolioLogs.items.push(...diffDoc.map((item) => item._id.toString()))
      covalentHistoricalPortfolioLogs = await covalentHistoricalPortfolioLogs.save()
    }

    logger.info('Store Covalent historical portfolio logs successfully')
  }

  /**
   *
   *
   * @param {string} chain_id
   * @param {string} public_key
   * @return {*}
   */
  private async getUserPortfolioChartData(chain_id: number, public_key: string, filtered_time: string) {
    let covalentHistoricalPortfolioLogs = await CovalentHistoricalPortfolioLogsModel.findOne({
      public_key: public_key.toLowerCase(),
      chain_id,
    })

    if (!covalentHistoricalPortfolioLogs) return []

    const tempMap = new Map<string, Map<string, number>>()
    const items = await CovalentHistoricalPortfolioItemsModel.find({
      portfolio_log_id: covalentHistoricalPortfolioLogs.id.toString(),
      id: { $in: covalentHistoricalPortfolioLogs.items },
    })
    items.forEach((item: any) => {
      JSON.parse(item.holdings).forEach((holding) => {
        if (!tempMap.get(holding.timestamp)) {
          tempMap.set(holding.timestamp, new Map())
        }
        ;['open', 'high', 'low', 'close'].forEach((field) => {
          if (tempMap.get(holding.timestamp)?.get(field)) {
            tempMap.get(holding.timestamp)?.set(field, tempMap.get(holding.timestamp)?.get(field) + holding.open.quote)
          } else {
            tempMap.get(holding.timestamp)?.set(field, holding.open.quote)
          }
        })
      })
    })

    const logs: Array<{
      timestamp: string
      value: number
    }> = []

    const keys = Array.from(tempMap.keys())

    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i]
      logs.push({
        timestamp: key,
        value:
          ((tempMap.get(key)?.get('open') ?? 0) +
            (tempMap.get(key)?.get('high') ?? 0) +
            (tempMap.get(key)?.get('low') ?? 0) +
            (tempMap.get(key)?.get('close') ?? 0)) /
          4,
      })
    }

    switch (filtered_time) {
      case '7d':
        return logs.slice(keys.length - 7)
      default:
        return logs
    }
  }
}
