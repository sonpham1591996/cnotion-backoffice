import * as express from 'express'
import walletsController from '../controllers/wallets.controller'

const walletsRouter = express.Router()

walletsRouter.get('/', walletsController.getListWallets)
walletsRouter.post('/', walletsController.createTrackingWallet)

export default walletsRouter
