import * as winston from 'winston'
import configs from './config'

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.message })
  }
  return info
})

const logger = winston.createLogger({
  level: configs.getValue('NODE_ENV') === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    configs.getValue('NODE_ENV') === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),

  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
})

export default logger
