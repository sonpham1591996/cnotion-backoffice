import { Request, Response } from 'express'
import { getNetworkScanLink, validateBSCPublicKey } from '../utils'
import { TransactionLogsModel } from './../models/transaction-logs.model'

/**
 *
 *
 * @param {Request} req
 * @param {Response} res
 */
export const searchTransactions = async (req: Request, res: Response) => {
  const { public_key, page_number, tx_hash } = req.body
  const SIZE = 10

  if (!validateBSCPublicKey(public_key)) {
    return res.status(400).json({ message: 'Invalid public key' })
  }

  let filters: any = {
    $or: [
      {
        from_address: public_key.toLowerCase(),
      },
      {
        to_address: public_key.toLowerCase(),
      },
    ],
  }

  if (tx_hash) {
    filters = {
      $and: [
        {
          $or: [
            {
              from_address: public_key.toLowerCase(),
            },
            {
              to_address: public_key.toLowerCase(),
            },
          ],
        },
        {
          tx_hash: tx_hash,
        },
      ],
    }
  }

  const transactionLogs = await TransactionLogsModel.find(filters)
    .skip(SIZE * ((page_number ?? 1) - 1))
    .limit(SIZE)

  const map = new Map()
  transactionLogs.forEach((log) => {
    map.set(log.tx_hash, log)
  })

  const transferAction = (transaction) =>
    transaction.log_events.filter(
      (logEvent) => logEvent.decoded && ['Transfer', 'Deposit'].indexOf(logEvent.decoded.name) >= 0
    )[0] ?? null

  return res.status(200).json({
    total: transactionLogs.length,
    data: Array.from(map.values())
      .map((transaction) => {
        const transferLog = transferAction(transaction)
        if (!transferLog || !transferLog.decoded) return null
        return {
          action: transferLog.decoded.name ?? '',
          tx_hash: `${getNetworkScanLink(transaction.chain_id)}/${transaction.tx_hash}`,
          from_address: transaction.from_address,
          to_address: transaction.to_address,
          ...{
            sender_contract_decimals: transferLog.sender_contract_decimals,
            sender_name: transferLog.sender_name,
            sender_address: transferLog.sender_address,
            value: (
              +(transferLog.decoded.params.filter((p) => p.name === 'value')[0]?.value ?? '0') /
              Math.pow(10, transferLog.sender_contract_decimals)
            ).toFixed(4),
          },
        }
      })
      .filter((d) => !!d),
    page_number: page_number,
    size: SIZE,
  })
}

const transactionsController = {
  searchTransactions,
}

export default transactionsController
