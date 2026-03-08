declare global {
  namespace Express {
    interface User {
      _id: string | import('mongoose').Types.ObjectId;
      name: string;
      email: string;
      role: 'super_admin' | 'admin';
      permissions: string[];
      isActive: boolean;
      [k: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
