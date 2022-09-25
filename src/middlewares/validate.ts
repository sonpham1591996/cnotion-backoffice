import { NextFunction, Request, Response } from 'express'
import logger from '../config/logger'
import validators from '../validators'

export const validator = (validator: string) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!validators[validator]) {
      return res.status(500).send()
    }

    try {
      const validated = await validators[validator].validate(req, res, next)
      if (validated) return next()
    } catch (error) {
      if (error.isJoi) {
        return res.status(422).json({ message: error.message })
      }
      logger.error('Validation occurred error', error.message)
      return res.status(500).send()
    }
  }
}
