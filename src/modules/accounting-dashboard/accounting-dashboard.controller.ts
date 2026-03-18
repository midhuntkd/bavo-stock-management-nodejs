import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import { catchAsync, sendSuccess } from '../utils';
import { isPrivilegedAccountingRole } from './accounting.helper';
import * as AccountingDashboardService from './accounting-dashboard.service';

export const dashboard: RequestHandler = catchAsync(async (_req, res) => {
  const data = await AccountingDashboardService.getAccountingDashboardSummary();
  sendSuccess(res, 'Accounting dashboard fetched successfully', data);
});

export const monthlySummary: RequestHandler = catchAsync(async (req, res) => {
  const data = await AccountingDashboardService.generateMonthlyAccountingSummary(Number(req.query.month), Number(req.query.year));
  sendSuccess(res, 'Monthly accounting summary fetched successfully', data);
});

export const userSummary: RequestHandler = catchAsync(async (req, res) => {
  if (!isPrivilegedAccountingRole(req.user?.roleCode) && String(req.user?._id) !== String(req.params.userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only view your own summary');
  }

  const data = await AccountingDashboardService.getUserAccountingSummary(
    String(req.params.userId),
    Number(req.query.month),
    Number(req.query.year)
  );
  sendSuccess(res, 'User accounting summary fetched successfully', data);
});