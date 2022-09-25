import { connect, ConnectOptions } from 'mongoose'
import envConfigs from './config'
import logger from './logger'

export const connectMongo = (options?: ConnectOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    connect(envConfigs.getValue('MONGODB_URL'), options, (error) => {
      if (error) throw reject(error)
      else {
        logger.info('Connected MongoDB')
        resolve()
      }
    })
  })
}

export default connectMongo
