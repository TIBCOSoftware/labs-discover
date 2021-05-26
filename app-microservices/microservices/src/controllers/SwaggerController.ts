import { ContentType, Get, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'js-yaml';
import fs from 'fs';

@Service()
@JsonController('/docs')
export class SwaggerController {

  constructor (){}

  public static getName = (): string => {
    return 'SwaggerController';
  }

  @Get('/api.yaml')
  @ContentType("application/yaml")
  get() {
    return this.generateSwagger();
  }

  generateSwagger() {
    // Get document, or throw exception on error
    let doc: any;
    try {
      doc = yaml.load(fs.readFileSync('./src/api.yaml', 'utf8'));
      logger.info(doc);
    } catch (e) {
      doc = null;
      console.log(e);
    }
    return doc;
  }
}