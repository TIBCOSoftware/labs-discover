import { Get, JsonController } from 'routing-controllers';
import swaggerJsdoc from 'swagger-jsdoc';
import { Service } from 'typedi';

@Service()
@JsonController('/docs')
export class SwaggerController {

  constructor (){}

  @Get('/swagger.json')
  get() {
    return this.generateSwagger();
  }

  generateSwagger() {
    const swaggerDefinition = {
      openapi: '3.0.1',
      info: {
        // API informations (required)
        title: 'Discover datasets API', // Title (required)
        version: '1.0.0', // Version (required)
        description: 'The datasets API', // Description (optional)
      },
      host: `https://discover.cloud.tibco.com`, // Host (optional)
      basePath: '/', // Base path (optional)
    };
    
    // Options for the swagger docs
    const options = {
      // Import swaggerDefinitions
      swaggerDefinition,
      // Path to the API docs
      // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
      apis: ['./dist/controllers/DatasetController.js'],
    };
    
    // Initialize swagger-jsdoc -> returns validated swagger spec in json format
    return swaggerJsdoc(options);
  }
}