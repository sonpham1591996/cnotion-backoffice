import { NETWORK_ENUM } from './../enums/index'

export function validateBSCPublicKey(public_key: string) {
  return public_key && public_key.startsWith('0x') && public_key.length >= 18
}

export function getNetworkScanLink(network_id: NETWORK_ENUM) {
  switch (network_id) {
    case NETWORK_ENUM.BSC:
      return `https://bscscan.com/tx/`
    default:
      throw new Error('Not found Scan Link')
  }
}
