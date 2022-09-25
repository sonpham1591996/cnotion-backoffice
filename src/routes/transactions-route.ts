import { Router } from 'express'
import { searchTransactions } from '../controllers/transactions.controller'

const transactionsRouter = Router()

// Get balances from public key
transactionsRouter.post('/search', searchTransactions)

export default transactionsRouter
