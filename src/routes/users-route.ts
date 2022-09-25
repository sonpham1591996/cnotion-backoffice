import { Router } from 'express'
import usersController from '../controllers/users.controller'
import { validator } from '../middlewares/validate'

const userRouter = Router()

userRouter.post('', validator('login'), usersController.login)

export default userRouter
