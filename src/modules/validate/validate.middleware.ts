import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../errors/ApiError';

const validate =
  (schema: Record<string, any>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req as any, Object.keys(validSchema) as any);

    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const details = error.details.map((d) => ({ path: d.path.join('.'), message: d.message }));
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Validation failed', true, details));
    }

    Object.assign(req, value);
    return next();
  };

export default validate;
