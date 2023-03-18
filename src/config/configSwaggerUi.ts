import { Application } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

export const configureSwagger = (app: Application) => {
  const filePath = path.join(__dirname, '../../openapi.yaml');
  const swaggerDoc = yaml.load(filePath);

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
};
