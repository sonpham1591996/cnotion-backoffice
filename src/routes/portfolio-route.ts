import { Router } from 'express'
import portfolioController from '../controllers/portfolio.controller'

const portfolioRouter = Router()

portfolioRouter.post('/', portfolioController.getPortfolioData)

export default portfolioRouter
