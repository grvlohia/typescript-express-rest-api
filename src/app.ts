/* eslint-disable import/first */
import dotenv from 'dotenv';
import path from 'path';

const dotenvResult = dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

if (dotenvResult.error) {
  throw dotenvResult.error;
}

import cors from 'cors';
import debug from 'debug';
import express from 'express';
import * as expressWinston from 'express-winston';
import * as http from 'http';
import * as winston from 'winston';

import { AuthRoutes } from './auth/auth.routes.config';
import { CommonRoutesConfig } from './common/common.routes.config';
import { openapiValidatorMiddleware } from './common/middleware/openapi.validator.middleware';
import { configureSwagger } from './config/configSwaggerUi';
import { errorHandler } from './config/errorHandler';
import { UsersRoutes } from './users/users.routes.config';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

// here we are adding middleware to parse all incoming requests as JSON
app.use(express.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// adding swagger and openapi-validator
configureSwagger(app);
app.use(openapiValidatorMiddleware);

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // when not debugging, log requests as one-liners
  if (typeof global.it === 'function') {
    loggerOptions.level = 'http'; // for non-debug test tuns, squelch entirely
  }
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

// adding routes to app
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));

const runningMessage = `Server running at http://localhost:${port}`;
app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);
});

app.use(errorHandler);

export default server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });
  console.log(runningMessage);
});
