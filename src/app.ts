import * as express from 'express'
import envConfigs from './config/config'
import morgan from './config/morgan'
import helmet from 'helmet'
import * as mongoSanitize from 'express-mongo-sanitize'
import * as compression from 'compression'
import * as cors from 'cors'
import * as passport from 'passport'
import jwtStrategy from './config/passport'
import authLimiter from './middlewares/rate-limiter'
import * as httpStatus from 'http-status'
import ApiError from './utils/api-error'
import errorMiddleware from './middlewares/error'
import router from './routes'

const xss = require('xss-clean')
//

const app = express()

if (envConfigs.getValue('NODE_ENV') !== 'test') {
  app.use(morgan.successHandler)
  app.use(morgan.errorHandler)
}

// set security for HTTP headers
app.use(helmet())

// parse json request body
app.use(express.json({ limit: '5mb' }))

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// sanitize request data
app.use(xss())
app.use(mongoSanitize())

// gzip compression
app.use(compression())

// enable cors
app.use(
  cors({
    origins: [envConfigs.getValue('CORS_ORIGIN')],
    optionsSuccessStatus: 200,
  })
)
app.options('*', cors())

app.disable('x-powered-by')

// jwt authentication
app.use(passport.initialize())
passport.use('jwt', jwtStrategy)

// limit repeated failed requests to auth endpoints
if (envConfigs.getValue('NODE_ENV') === 'production') {
  app.use('/v1', authLimiter, router)
} else {
  app.use('/v1', router)
}

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'))
})

// Covert error to ApiError, if needed
app.use(errorMiddleware.errorConverter)

// Handle error
app.use(errorMiddleware.errorHandler)

export default app
