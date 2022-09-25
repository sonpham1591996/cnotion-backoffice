import * as httpStatus from 'http-status'
import ApiError from '../utils/api-error'
import roles from '../config/roles'
import * as passport from 'passport'

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'))
  }

  req.user = user

  if (requiredRights.length) {
    const userRights: any = roles.roleRights.get(user.role)
    const hasRequiredRights = requiredRights.every((requiredRight: any) => userRights?.includes(requiredRight))
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'))
    }
  }

  resolve()
}

const auth =
  (...requiredRights: string[]) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      )
    })
      .then(() => next())
      .catch((error) => next(error))
  }

export default auth
