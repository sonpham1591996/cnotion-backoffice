// Main worker
import { Agenda } from 'agenda'
import envConfigs from '../config/config'
import { JobAction } from './job-handler'
import balanceTokenJobs from './jobs/balance-token-jobs'
import historicalPortfolioJobs from './jobs/historical-portfolio-jobs'
import transactionJobs from './jobs/transactions-jobs'

const agenda = new Agenda({
  db: {
    address: envConfigs.getValue('MONGODB_URL'),
    collection: 'agendaJobs',
  },
  defaultLockLimit: 0,
  defaultConcurrency: 2,
  maxConcurrency: 2,
})

export const startAgendaWorker = () => {
  const jobTypes = envConfigs.getValue('AGENDA_JOB_TYPES') ? envConfigs.getValue('AGENDA_JOB_TYPES').split(',') : []

  jobTypes.forEach((type: string) => {
    if (type === 'balance-token') {
      balanceTokenJobs(agenda)
    } else if (type === 'historical-portfolio') {
      historicalPortfolioJobs(agenda)
    } else if (type === 'transactions') {
      transactionJobs(agenda)
    }
  })

  if (jobTypes.length > 0) {
    agenda.start()
  }
}

export const cancelJob = async (name: JobAction) => {
  await agenda.cancel({ name })
}
