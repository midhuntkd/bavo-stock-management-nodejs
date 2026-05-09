import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errors/ApiError';
import logger from '../logger/logger';
import { RoleService } from '../role';
import * as TokenService from '../token/token.service';
import * as UserService from '../user/user.service';

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization || (req.headers['x-access-token'] as string | undefined);
  if (!authHeader) return null;

  const trimmed = String(authHeader).trim();
  let token = trimmed;

  if (/^bearer\s+/i.test(trimmed)) {
    token = trimmed.replace(/^bearer\s+/i, '').trim();
  }

  // Some clients accidentally send quoted tokens: Bearer "eyJ..."
  token = token.replace(/^"+|"+$/g, '');
  return token || null;
};

const isAuthDebugEnabled = () => process.env.AUTH_DEBUG === 'true';

const logAuthDebug = (req: Request, payload: Record<string, unknown>) => {
  if (!isAuthDebugEnabled()) return;

  logger.debug(
    JSON.stringify({
      scope: 'auth',
      method: req.method,
      path: req.originalUrl || req.path,
      ...payload,
    })
  );
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    if (!token) return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authorization token missing'));

    const payload = TokenService.verifyAccessToken(token);
    if (payload.type !== 'access') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid access token'));
    }

    const user = await UserService.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid auth token'));
    }

    const rolePermissions = await RoleService.getRolePermissionCodes(String(user.roleId));
    const effectivePermissions =
      user.roleCode === 'super_admin' ? ['*'] : [...new Set([...rolePermissions, ...(user.permissions || [])])];

    req.user = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      roleId: String(user.roleId),
      roleCode: user.roleCode as any,
      permissions: user.permissions || [],
      effectivePermissions,
      isActive: user.isActive,
    } as any;

    logAuthDebug(req, {
      stage: 'authenticate',
      userId: String(user._id),
      roleId: String(user.roleId),
      roleCode: user.roleCode,
      directPermissions: user.permissions || [],
      effectivePermissions,
    });

    return next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Access token expired'));
    }
    if (error?.name === 'JsonWebTokenError') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid auth token'));
    }
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication failed'));
  }
};

export const authorizeRoles = (...allowedRoleCodes: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required'));
    }
    if (!allowedRoleCodes.includes(req.user.roleCode)) {
      logAuthDebug(req, {
        stage: 'authorizeRoles',
        failureReason: 'role_not_allowed',
        allowedRoleCodes,
        userId: req.user._id,
        roleCode: req.user.roleCode,
        effectivePermissions: (req.user as any).effectivePermissions || [],
      });
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: insufficient role permission'));
    }
    return next();
  };

export const authorizePermissions = (...requiredPermissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required'));
    }

    if (req.user.roleCode === 'super_admin') return next();

    const effectivePermissions = (req.user as any).effectivePermissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) => effectivePermissions.includes(permission));

    if (!hasAllPermissions) {
      logAuthDebug(req, {
        stage: 'authorizePermissions',
        failureReason: 'missing_required_permission',
        requiredPermissions,
        userId: req.user._id,
        roleCode: req.user.roleCode,
        effectivePermissions,
      });
      return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: permission denied'));
    }

    return next();
  };

const auth = (...allowedRoles: string[]) => [authenticate, authorizeRoles(...allowedRoles)];

export default auth;
