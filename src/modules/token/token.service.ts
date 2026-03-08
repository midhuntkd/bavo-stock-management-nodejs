import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../../configs/config';
import Token from './token.model';

interface Payload {
  sub: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export const generateToken = (userId: Types.ObjectId, type: 'access' | 'refresh', expiresIn: number) =>
  jwt.sign({ sub: String(userId), type }, config.jwt.secret, { expiresIn });

export const generateAuthTokens = async (userId: Types.ObjectId) => {
  const accessToken = generateToken(userId, 'access', Number(config.jwt.accessExpirationMinutes) * 60);
  const refreshToken = generateToken(userId, 'refresh', Number(config.jwt.refreshExpirationDays) * 24 * 60 * 60);

  const expires = new Date();
  expires.setDate(expires.getDate() + Number(config.jwt.refreshExpirationDays));

  await Token.create({
    token: refreshToken,
    user: userId,
    type: 'refresh',
    expires,
  });

  return {
    access: { token: accessToken },
    refresh: { token: refreshToken, expires },
  };
};

export const verifyToken = (token: string): Payload => jwt.verify(token, config.jwt.secret) as Payload;

export const verifyRefreshToken = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken);

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  const tokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh', blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Refresh token not found');
  }

  return { payload, tokenDoc };
};

export const invalidateRefreshToken = async (refreshToken: string) => {
  await Token.findOneAndUpdate({ token: refreshToken, type: 'refresh' }, { blacklisted: true });
};
