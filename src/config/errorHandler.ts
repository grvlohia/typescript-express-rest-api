import debug from 'debug';
import { NextFunction, Request, Response } from 'express';

const log = debug('app:error-handler');

export function errorHandler(
  error: Error & { status?: number; errors: unknown[] },
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  log(error);
  const status = error.status ?? 500;
  response.status(status).json({
    message: error.message,
    errors: error.errors,
  });
}
