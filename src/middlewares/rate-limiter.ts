import rateLimit from 'express-rate-limit'
import envConfigs from '../config/config'

const authLimiter = rateLimit({
  windowMs: envConfigs.getValue('RATE_LIMIT_WINDOW_MS') ? +envConfigs.getValue('RATE_LIMIT_WINDOW_MS') : 60 * 1000,
  max: envConfigs.getValue('RATE_LIMIT_MAX_REQS') ? +envConfigs.getValue('RATE_LIMIT_MAX_REQS') : 20,
  skipSuccessfulRequests: true,
})

export default authLimiter
