import jwt from 'jsonwebtoken';
import ms from 'ms';
import { Types } from 'mongoose';
import config from '../../configs/config';
import Token from './token.model';

interface TokenPayload {
  sub: string;
  type: 'access' | 'refresh' | 'reset_password';
  iat: number;
  exp: number;
}

const getExpiryDate = (duration: string) => new Date(Date.now() + ms(duration as ms.StringValue));

export const generateToken = (userId: Types.ObjectId, type: 'access' | 'refresh' | 'reset_password', expiresIn: string, secret: string) =>
  jwt.sign({ sub: String(userId), type }, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });

export const generateAuthTokens = async (userId: Types.ObjectId) => {
  const accessToken = generateToken(userId, 'access', config.jwt.accessExpiresIn, config.jwt.accessSecret);
  const refreshToken = generateToken(userId, 'refresh', config.jwt.refreshExpiresIn, config.jwt.refreshSecret);
  const refreshTokenExpires = getExpiryDate(config.jwt.refreshExpiresIn);

  await Token.create({ token: refreshToken, user: userId, type: 'refresh', expires: refreshTokenExpires });

  return {
    access: { token: accessToken, expires: getExpiryDate(config.jwt.accessExpiresIn) },
    refresh: { token: refreshToken, expires: refreshTokenExpires },
  };
};

export const generateResetPasswordToken = async (userId: Types.ObjectId, expiresIn = '30m') => {
  const token = generateToken(userId, 'reset_password', expiresIn, config.jwt.accessSecret);
  const expires = getExpiryDate(expiresIn);
  await Token.create({ token, user: userId, type: 'reset_password', expires });
  return { token, expires };
};

export const verifyToken = (token: string, secret: string): TokenPayload => jwt.verify(token, secret) as TokenPayload;

export const verifyAccessToken = (token: string) => verifyToken(token, config.jwt.accessSecret);

export const verifyRefreshToken = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken, config.jwt.refreshSecret);
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  const tokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false, expires: { $gt: new Date() } });
  if (!tokenDoc) {
    throw new Error('Refresh token not found or expired');
  }
  return { payload, tokenDoc };
};

export const deleteToken = async (token: string, type: 'refresh' | 'reset_password') =>
  Token.findOneAndDelete({ token, type });
