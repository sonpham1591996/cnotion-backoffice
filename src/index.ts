import app from './app'
import envConfigs from './config/config'
import connectMongo from './config/connectMongo'
import logger from './config/logger'
import { RedisService } from './services/redis.service'

let server

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed')
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
}

const init = async () => {
  await connectMongo()
  await RedisService.getInstance().connect()
  server = app.listen(envConfigs.getValue('PORT'), () => {
    logger.info(`Listening to port ${envConfigs.getValue('PORT')}`)
  })
}

try {
  init()
} catch (error) {
  exitHandler()
}

const unexpectedErrorHandler = (err) => {
  logger.error(err)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close()
  }
})
