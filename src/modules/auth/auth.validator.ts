import Joi from 'joi';
import validate from '../validate/validate.middleware';

export const login = validate({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

export const refreshTokens = validate({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

export const logout = validate({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});
