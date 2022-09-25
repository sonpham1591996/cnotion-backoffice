import { Router } from 'express'
import portfolioRouter from './portfolio-route'
import walletsRouter from './wallets-route'
import usersRouter from './users-route'
import auth from '../middlewares/auth'
import transactionsRouter from './transactions-route'

const router = Router()

router.use('/portfolio', auth(), portfolioRouter)
router.use('/wallets', auth(), walletsRouter)
router.use('/transactions', auth(), transactionsRouter)
router.use('/users', usersRouter)

export default router
