import { RequestHandler } from 'express';
import { catchAsync, sendSuccess } from '../utils';
import * as DashboardService from './dashboard.service';

export const summary: RequestHandler = catchAsync(async (_req, res) => {
  const data = await DashboardService.getSummary();
  sendSuccess(res, 'Dashboard summary fetched successfully', data);
});
