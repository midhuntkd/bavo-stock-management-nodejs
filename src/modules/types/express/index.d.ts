import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: string | Types.ObjectId;
      name: string;
      email: string;
      roleId: string | Types.ObjectId;
      roleCode: string;
      permissions: string[];
      effectivePermissions?: string[];
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

export {};
