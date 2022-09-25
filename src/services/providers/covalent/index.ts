import axios from 'axios'
import envConfigs from '../../../config/config'

async function getBalances(network_id: number, public_key: string) {
  const result = await axios.get(
    `${envConfigs.getValue(
      'COVALENT_ENDPOINT'
    )}${network_id}/address/${public_key}/balances_v2/?key=${envConfigs.getCovalentApiKey()}`
  )

  if (result.status !== 200) {
    return null
  }

  return {
    public_key: result.data.data.address,
    quote_currency: result.data.data.quote_currency,
    chain_id: result.data.data.chain_id,
    items: result.data.data.items,
  }
}

async function getHistoricalPortfolio(network_id: number, public_key: string, days_option?: number) {
  const res = await axios.get(
    `${envConfigs.getValue(
      'COVALENT_ENDPOINT'
    )}${network_id}/address/${public_key}/portfolio_v2/?key=${envConfigs.getCovalentApiKey()}${
      days_option ? `&days=${days_option}` : ''
    }`
  )

  if (res.status !== 200) {
    return null
  }

  return {
    public_key: res.data.data.address,
    quote_currency: res.data.data.quote_currency,
    chain_id: res.data.data.chain_id,
    items: res.data.data.items,
    updated_at: res.data.data.updated_at,
  }
}

async function getTransactions(network_id: number, public_key: string) {
  const res = await axios.get(
    `${envConfigs.getValue(
      'COVALENT_ENDPOINT'
    )}${network_id}/address/${public_key}/transactions_v2/?key=${envConfigs.getCovalentApiKey()}`
  )

  if (res.status !== 200) {
    return null
  }

  return {
    public_key: res.data.data.address,
    quote_currency: res.data.data.quote_currency,
    chain_id: res.data.data.chain_id,
    items: res.data.data.items,
  }
}

async function getTransaction(network_id: number, tx_hash: string) {
  const res = await axios.get(
    `${envConfigs.getValue(
      'COVALENT_ENDPOINT'
    )}${network_id}/transaction_v2/${tx_hash}/?quote-currency=USD&format=JSON&no-logs=false&key=${envConfigs.getCovalentApiKey()}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  if (res.status !== 200) {
    return null
  }
  return {
    items: res.data.data.items,
  }
}

const covalentProvider = {
  getBalances,
  getHistoricalPortfolio,
  getTransaction,
  getTransactions,
}

export default covalentProvider
