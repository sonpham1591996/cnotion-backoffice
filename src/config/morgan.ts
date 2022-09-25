import * as morgan from 'morgan'
import configs from './config'
import logger from './logger'

morgan.token('message', (req, res) => res.locals.errorMessage ?? '')

const getIpFormat = () => (configs.getValue('NODE_ENV') === 'production' ? ':remote-addr -' : '')

const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`

const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms -message :message`

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
})

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.info(message.trim()) },
})

export default {
  successHandler,
  errorHandler,
}
