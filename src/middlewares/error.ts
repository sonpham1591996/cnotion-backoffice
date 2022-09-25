import * as httpStatus from 'http-status'
import mongoose from 'mongoose'
import envConfigs from '../config/config'
import logger from '../config/logger'
import ApiError from '../utils/api-error'

const errorConverter = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR

    const message = error.message || httpStatus[statusCode]

    error = new ApiError(statusCode, message, false, err.stack)
  }

  next(error)
}

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err

  if (envConfigs.getValue('NODE_ENV') === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    message = httpStatus[statusCode]
  }

  res.locals.errorMessage = err.message

  const response = {
    code: statusCode,
    message,
    ...(envConfigs.getValue('NODE_ENV') === 'development' && { stack: err.stack }),
  }

  if (envConfigs.getValue('NODE_ENV') === 'development') {
    logger.error(err)
  }

  res.status(statusCode).send(response)
}

export default {
  errorConverter,
  errorHandler,
}
