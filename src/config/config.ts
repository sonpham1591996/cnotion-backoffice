import * as dotenv from 'dotenv'
import * as Joi from 'joi'

export type IConfigurationKeys =
  | 'NODE_ENV'
  | 'PORT'
  | 'MONGODB_URL'
  | 'RATE_LIMIT_WINDOW_MS'
  | 'RATE_LIMIT_MAX_REQS'
  | 'CORS_ORIGIN'
  | 'JWT_SECRET'
  | 'JWT_EXPIRED_IN_MINUTE'
  | 'AGENDA_JOB_TYPES'
  | 'REDIS_URI'
  | 'REDIS_CLUSTER'
  | 'REDIS_CLUSTER_PASSWORD'
  | 'REDIS_CLUSTER_TLS'
  | 'REDIS_CLUSTER_STARTNODES'
  | 'COVALENT_ENDPOINT'
  | 'COVALENT_API_KEY'

export interface IConfigurations {
  NODE_ENV?: string
  PORT?: number
  MONGODB_URL?: string
  RATE_LIMIT_WINDOW_MS?: number
  RATE_LIMIT_MAX_REQS?: number
  CORS_ORIGIN?: string
  JWT_SECRET?: string
  JWT_EXPIRED_IN_MINUTE?: string
  AGENDA_JOB_TYPES?: string
  REDIS_URI?: string
  REDIS_CLUSTER?: string
  REDIS_CLUSTER_PASSWORD?: string
  REDIS_CLUSTER_TLS?: string
  REDIS_CLUSTER_STARTNODES?: string
  COVALENT_ENDPOINT?: string
  COVALENT_API_KEY?: string
}

dotenv.config()

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB URL'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRED_IN_MINUTE: Joi.number().required().description('JWT expire in minutes'),
    RATE_LIMIT_WINDOW_MS: Joi.number().default(60000).description('Rate limit max request in window ms'),
    RATE_LIMIT_MAX_REQS: Joi.number().default(20).description('Max request for rate limit'),
    CORS_ORIGIN: Joi.string().required().description('Cors origin'),
    AGENDA_JOB_TYPES: Joi.string().required(),
    REDIS_URI: Joi.string().required(),
    REDIS_CLUSTER: Joi.boolean().required(),
    REDIS_CLUSTER_PASSWORD: Joi.allow().empty(),
    REDIS_CLUSTER_TLS: Joi.boolean().required(),
    REDIS_CLUSTER_STARTNODES: Joi.allow().empty(),
    COVALENT_ENDPOINT: Joi.string().required(),
    COVALENT_API_KEY: Joi.string().required(),
  })
  .unknown()

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envConfigs = {
  getValue: (key: IConfigurationKeys) => {
    return envVars[key]
  },

  getCovalentApiKey: () => {
    const keys = envVars['COVALENT_API_KEY']
    const splittedKeys = keys.split(',')
    return splittedKeys.length > 1 ? splittedKeys[Math.floor(Math.random() * splittedKeys.length)] : splittedKeys[0]
  },
}

export default envConfigs
