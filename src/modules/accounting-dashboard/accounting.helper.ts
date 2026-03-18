import httpStatus from 'http-status';
import { Types } from 'mongoose';
import ApiError from '../errors/ApiError';

export const ACCOUNTING_PRIVILEGED_ROLES = ['super_admin', 'admin', 'director'] as const;

export const isPrivilegedAccountingRole = (roleCode?: string | null) =>
  !!roleCode && ACCOUNTING_PRIVILEGED_ROLES.includes(roleCode as (typeof ACCOUNTING_PRIVILEGED_ROLES)[number]);

export const ensureObjectId = (value: string, label: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
  }
  return new Types.ObjectId(value);
};

export const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const getMonthDateRange = (month: number, year: number) => {
  if (month < 1 || month > 12) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Month must be between 1 and 12');
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

export const getDateRangeFromQuery = (query: Record<string, any>, dateField: string) => {
  let start: Date | undefined;
  let end: Date | undefined;

  if (query.month && query.year) {
    const range = getMonthDateRange(Number(query.month), Number(query.year));
    start = range.start;
    end = range.end;
  }

  if (query.startDate) {
    start = new Date(query.startDate);
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    endDate.setUTCHours(23, 59, 59, 999);
    end = endDate;
  }

  if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date range');
  }

  if (start && end && start > end) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'startDate cannot be greater than endDate');
  }

  if (!start && !end) {
    return {};
  }

  return {
    [dateField]: {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lte: end } : {}),
    },
  };
};

export const getSignedTransactionAmount = (type: string, amount: number) => {
  if (['credit', 'transfer_in', 'opening'].includes(type)) {
    return amount;
  }

  if (['debit', 'transfer_out'].includes(type)) {
    return amount * -1;
  }

  return 0;
};

export const roundToCurrency = (value: number) => Number((value || 0).toFixed(2));