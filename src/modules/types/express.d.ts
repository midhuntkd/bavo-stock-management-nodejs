import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: string | Types.ObjectId;
      name: string;
      email: string;
      role: 'super_admin' | 'admin';
      permissions: string[];
      isActive: boolean;
      [k: string]: any;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: Express.User;
  }
}
