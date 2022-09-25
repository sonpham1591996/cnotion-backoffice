import logger from '../config/logger'
import { PROVIDER_ENUM } from '../enums'
import {
  GET_TRANSACTIONS_BY_ADDRESS_JOB_DATA,
  GET_TRANSACTION_DETAIL_JOB_DATA,
} from '../workers/jobs/transactions-jobs'
import { TransactionLogsModel } from './../models/transaction-logs.model'
import covalentProvider from './providers/covalent'

export class TransactionLogsService {
  private static _instance: TransactionLogsService

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new TransactionLogsService()
    return this._instance
  }
  /**
   *
   *
   * @param {GET_TRANSACTIONS_BY_ADDRESS_JOB_DATA} job_data
   * @return {*}
   * @memberof TransactionLogsService
   */
  async getTransactions(job_data: GET_TRANSACTIONS_BY_ADDRESS_JOB_DATA) {
    switch (job_data.provider) {
      case PROVIDER_ENUM.COVALENT:
        const data = await covalentProvider.getTransactions(job_data.network_id, job_data.public_key)
        await this.storeTransactionLogsData(data)
        return
      default:
        throw new Error('Invalid provider')
    }
  }
  /**
   *
   *
   * @param {GET_TRANSACTION_DETAIL_JOB_DATA} job_data
   * @return {*}
   * @memberof TransactionLogsService
   */
  async getTransactionDetail(job_data: GET_TRANSACTION_DETAIL_JOB_DATA) {
    const detailData = await covalentProvider.getTransaction(job_data.network_id, job_data.tx_hash)
    logger.info('Get transaction detail from tx_hash: ' + job_data.tx_hash)

    if (!detailData || !detailData.items || detailData.items.length === 0) {
      return
    }

    let transactionItems = detailData.items.map((c) => {
      return { ...c, transaction_id: c.tx_hash }
    })
    const txHashFromDB = await TransactionLogsModel.find(
      {
        tx_hash: { $in: transactionItems.map((item) => item.tx_hash) },
      },
      ['tx_hash']
    )

    const diff = transactionItems.filter((item) => txHashFromDB.map((obj) => obj.tx_hash).indexOf(item.tx_hash) < 0)

    const transactionLogs = diff.map((c) => {
      let transactionLog = new TransactionLogsModel()
      transactionLog.public_key = c.from_address
      transactionLog.quote_currency = 'USD'
      transactionLog.chain_id = job_data.network_id
      transactionLog.block_signed_at = c.block_signed_at
      transactionLog.block_height = c.block_height
      transactionLog.tx_hash = c.tx_hash
      transactionLog.from_address = c.from_address
      transactionLog.to_address = c.to_address
      transactionLog.value = c.value
      transactionLog.value_quote = c.value_quote
      transactionLog.gas_offered = c.gas_offered
      transactionLog.gas_spent = c.gas_spent
      transactionLog.gas_price = c.gas_price
      transactionLog.fees_paid = c.fees_paid
      transactionLog.gas_quote = c.gas_quote
      transactionLog.gas_quote_rate = c.gas_quote_rate
      transactionLog.log_events = c.log_events
      return transactionLog
    })

    await TransactionLogsModel.insertMany(transactionLogs, { ordered: false })
    logger.info('Insert transaction detail from tx_hash: ' + job_data.tx_hash)
  }
  /**
   *
   *
   * @private
   * @param {*} data
   * @memberof TransactionLogsService
   */
  private async storeTransactionLogsData(data: any) {
    if ((data?.items?.length ?? 0) === 0) return

    const MAX_CHUNK_SIZE = 20
    for (let i = 0; i < data.items.length; i += MAX_CHUNK_SIZE) {
      const chunk = data.items.slice(i, i + MAX_CHUNK_SIZE)

      const txHashFromDB = await TransactionLogsModel.find(
        {
          tx_hash: { $in: chunk.map((item) => item.tx_hash) },
        },
        ['tx_hash']
      )

      let diff = chunk.filter((item) => txHashFromDB.map((obj) => obj.tx_hash).indexOf(item.tx_hash) < 0)

      const transactionLogs = diff.map((c) => {
        let transactionLog = new TransactionLogsModel()
        transactionLog.public_key = data.public_key
        transactionLog.quote_currency = data.quote_currency
        transactionLog.chain_id = data.chain_id
        transactionLog.block_signed_at = c.block_signed_at
        transactionLog.block_height = c.block_height
        transactionLog.tx_hash = c.tx_hash
        transactionLog.from_address = c.from_address
        transactionLog.to_address = c.to_address
        transactionLog.value = c.value
        transactionLog.value_quote = c.value_quote
        transactionLog.gas_offered = c.gas_offered
        transactionLog.gas_spent = c.gas_spent
        transactionLog.gas_price = c.gas_price
        transactionLog.fees_paid = c.fees_paid
        transactionLog.gas_quote = c.gas_quote
        transactionLog.gas_quote_rate = c.gas_quote_rate
        transactionLog.log_events = c.log_events
        return transactionLog
      })

      await TransactionLogsModel.insertMany(transactionLogs)
    }
    logger.info('Store transaction logs successfully')
  }
}
