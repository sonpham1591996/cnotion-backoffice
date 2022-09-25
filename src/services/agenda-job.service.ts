import { AgendaJobModel } from "../models/agenda-jobs.model";

export class AgendaJobService {
  private static _instance: AgendaJobService;

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new AgendaJobService();
    return this._instance;
  }

  async getJob(name: string, public_key: string) {
    const job = await AgendaJobModel.findOne({
      name,
      type: 'normal',
      'data.publicKey': public_key,
      failReason: null,
      failedAt: null,
      failCount: null,
      lockedAt: null,
    });
    return job;
  }

  async getJobByName(name: string) {
    const job = await AgendaJobModel.findOne({
      name,
    });
    return job;
  }
}
