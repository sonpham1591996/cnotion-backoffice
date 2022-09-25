import * as Redis from 'ioredis'
import Redlock, { ResourceLockedError } from 'redlock'
import envConfigs from '../config/config'
import logger from '../config/logger'

type RedisClientType = Redis.Cluster | Redis.Redis

export class RedisService {
  private static _instance: RedisService

  public redisClient: RedisClientType | null
  public redisLock: Redlock | null

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new RedisService()
    return this._instance
  }

  connect(): Promise<void> {
    if (envConfigs.getValue('REDIS_CLUSTER')) {
      const redisOpts = {
        password: envConfigs.getValue('REDIS_CLUSTER_PASSWORD'),
      }

      if (envConfigs.getValue('REDIS_CLUSTER_TLS')) {
        // @ts-ignore
        redisOpts.tls = true
      }

      this.redisClient = new Redis.Cluster(envConfigs.getValue('REDIS_CLUSTER_STARTNODES') as any, {
        dnsLookup: (address: any, callback: any) => callback(null, address),
        // @ts-ignore
        redisOpts,
      })
    } else {
      // @ts-ignore
      this.redisClient = new Redis(envConfigs.getValue('REDIS_URI'))
    }

    this.redisClient.on('error', (error: any) => {
      logger.error('Connect Redis error', error)
    })

    this.redisLock = new Redlock([this.redisClient], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200, // time in ms
      retryJitter: 200, // time in ms
      automaticExtensionThreshold: 500, // time in ms
    })

    this.redisLock.on('error', (error) => {
      if (error instanceof ResourceLockedError) {
        return
      }
      logger.error(error)
    })
    logger.info('Connected Redis')
    return Promise.resolve()
  }

  setEx(key: string, expired_in: number, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.redisClient) return reject('Invalid redisClient')
      this.redisClient.setex(key, expired_in, value, function (err, result) {
        if (err) {
          return reject(err)
        }
        if (result === 'OK') {
          return resolve(result)
        }
        return reject('Error during cache')
      })
    })
  }

  async close() {
    if (this.redisClient) await this.redisClient.quit()
    this.redisLock = null
    this.redisClient = null
  }
}
