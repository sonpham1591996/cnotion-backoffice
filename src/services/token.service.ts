import * as moment from 'moment'
import * as jwt from 'jsonwebtoken'
import envConfigs from '../config/config'
/**
 *
 *
 * @param {string} public_key
 * @param {*} expires
 * @param {string} secret
 * @return {*}
 */
const generateToken = (public_key: string, expires: any, secret: string) => {
  const payload = {
    sub: public_key,
    iat: moment().unix(),
    exp: expires.unix(),
  }

  return jwt.sign(payload, secret)
}

/**
 *
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, secret) => {
  const payload = jwt.verify(token, secret)
  if (!payload) {
    throw new Error('payload not found')
  }
  return payload
}

/**
 * Generate auth tokens
 * @param {string} public_key
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (public_key: string) => {
  const accessTokenExpires = moment().add(envConfigs.getValue('JWT_EXPIRED_IN_MINUTE'), 'minutes')
  const accessToken = generateToken(public_key, accessTokenExpires, envConfigs.getValue('JWT_SECRET'))

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  }
}

const tokenService = {
  generateAuthTokens,
}

export default tokenService
