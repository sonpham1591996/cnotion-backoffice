import { Request, Response } from 'express'
import { validateBSCPublicKey } from '../utils'
import { PortfolioService } from './../services/portfolio.service'

const getPortfolioData = async (req: Request, res: Response) => {
  const { address, filtered_time } = req.body
  const user_public_key = req.user as string

  if (!validateBSCPublicKey(user_public_key)) {
    return res.status(400).json({ message: 'Invalid public key' })
  }
  if (['7d', '30d'].indexOf(filtered_time) < 0) {
    return res.status(400).json({ message: 'Invalid filtered_time' })
  }

  try {
    const data = await PortfolioService.getInstance().getPortfolioData(address ?? user_public_key, filtered_time)
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).json({ message: 'Server internal error, please try again.' })
  }
}

const portfolioController = {
  getPortfolioData,
}

export default portfolioController
