import logger from '../config/logger'
import { connectMongo } from './../config/connectMongo'
import { RedisService } from './../services/redis.service'
import { startAgendaWorker } from './agenda'

const initWorker = async () => {
  try {
    await connectMongo()
    await RedisService.getInstance().connect()
    startAgendaWorker()
    logger.info('Worker Service is running...')
  } catch (error) {
    logger.error('Internal server error: ', error)
    process.exit(1)
  }
}

initWorker()
