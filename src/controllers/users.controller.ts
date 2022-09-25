import { Request, Response } from 'express'
import tokenService from '../services/token.service'
import { UsersModel } from './../models/users.model'

const login = async (req: Request, res: Response) => {
  const body = req.body

  let user = await UsersModel.findOne({ address: body.address.toLowerCase() })

  if (!user) {
    user = new UsersModel()
    user.address = body.address.toLowerCase()
  }
  user.nonce = body.nonce
  user = await user.save()

  const token = await tokenService.generateAuthTokens(user.address)
  return res.status(200).send(token.access.token)
}

const usersController = {
  login,
}

export default usersController
