import { PortfolioService } from './../services/portfolio.service'
import { Request, Response } from 'express'
import { validateBSCPublicKey } from '../utils'
import { UserTrackingWalletsModel } from '../models/user-tracking-wallets.model'

const getListWallets = async (req: Request, res: Response) => {
  const user_public_key = req.user as string

  if (!validateBSCPublicKey(user_public_key)) {
    return res.status(400).json({ message: 'Invalid public key' })
  }

  const userTrackingWallets = await UserTrackingWalletsModel.find(
    {
      user_wallet_address: user_public_key,
    },
    undefined,
    { sort: { updated_ts: -1 } }
  )

  return res.status(200).send(
    userTrackingWallets.map((udw) => {
      return {
        tracking_wallet_address: udw.tracking_wallet_address,
        alias: udw.alias,
      }
    })
  )
}

const createTrackingWallet = async (req: Request, res: Response) => {
  const user_public_key = req.user as string
  if (!validateBSCPublicKey(user_public_key)) {
    return res.status(400).json({ message: 'Invalid public key' })
  }
  const body = req.body

  if (!validateBSCPublicKey(body.tracking_wallet_address)) {
    return res.status(400).json({ message: 'Invalid tracking_wallet_address' })
  }

  let userTrackingWallet = await UserTrackingWalletsModel.findOne({
    user_wallet_address: user_public_key,
    tracking_wallet_address: body.tracking_wallet_address,
  })

  if (userTrackingWallet) return res.status(200).send()

  userTrackingWallet = new UserTrackingWalletsModel()
  userTrackingWallet.user_wallet_address = user_public_key
  userTrackingWallet.tracking_wallet_address = body.tracking_wallet_address
  userTrackingWallet.alias = body.alias
  userTrackingWallet.notes = body.notes
  await userTrackingWallet.save()

  await PortfolioService.getInstance().getPortfolioData(body.tracking_wallet_address, '7d')
  return res.status(200).send()
}

const walletsController = {
  getListWallets,
  createTrackingWallet,
}

export default walletsController
