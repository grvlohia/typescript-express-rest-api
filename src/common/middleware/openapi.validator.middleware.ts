import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';

const spec = path.join(__dirname, '../../../openapi.yaml');

export const openapiValidatorMiddleware = OpenApiValidator.middleware({
  apiSpec: spec,
  validateRequests: true,
  validateResponses: false,
  validateFormats: 'full',
});
