import { Response } from 'express';

export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data?: T;
  public meta?: Record<string, any>;
  public status: number;

  constructor({ success = true, message, data, meta, status = 200 }: { success?: boolean; message: string; data?: T; meta?: Record<string, any>; status?: number }) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.status = status;
  }

  send(res: Response): void {
    res.status(this.status).json({
      success: this.success,
      message: this.message,
      ...(typeof this.data !== 'undefined' ? { data: this.data } : {}),
      ...(typeof this.meta !== 'undefined' ? { meta: this.meta } : {}),
    });
  }
}

export const sendSuccess = <T>(res: Response, message: string, data?: T, status = 200, meta?: Record<string, any>) => {
  new ApiResponse<T>({ success: true, message, data, status, meta }).send(res);
};
