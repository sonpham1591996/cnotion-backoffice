import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersModel } from '../models/users.model'
import configs from './config'

const jwtOptions = {
  secretOrKey: configs.getValue('JWT_SECRET'),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
}

const jwtVerify = async (payload, done) => {
  try {
    if (!payload || !payload.sub) throw new Error('Invalid token')
    const user = await UsersModel.findOne({
      address: payload.sub,
    })
    if (!user) {
      return done(null, false)
    }
    done(null, user.address)
  } catch (error) {
    done(error, false)
  }
}

const jwtStrategy = new Strategy(jwtOptions, jwtVerify)

export default jwtStrategy
