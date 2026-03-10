import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import * as TokenService from '../token/token.service';
import * as UserService from '../user/user.service';

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const request = req as any;
    const token = getBearerToken(req);
    if (!token) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authorization token missing'));
    }

    const payload = TokenService.verifyToken(token);
    if (payload.type !== 'access') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token'));
    }

    const user = await UserService.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid auth token'));
    }

    request.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
    };

    return next();
  } catch (_error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid auth token'));
  }
};

export const authorizeRoles = (...allowedRoles: Array<'super_admin' | 'admin'>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const request = req as any;

    if (!request.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required'));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: insufficient role permission'));
    }

    return next();
  };

export const authorizePermissions = (...requiredPermissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const request = req as any;

    if (!request.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required'));
    }

    if (request.user.role === 'super_admin') {
      return next();
    }

    const userPermissions = request.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: permission denied'));
    }

    return next();
  };

const auth = (...allowedRoles: Array<'super_admin' | 'admin'>) => [authenticate, authorizeRoles(...allowedRoles)];

export default auth;
