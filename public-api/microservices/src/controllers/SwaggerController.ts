import { ContentType, Get, JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { logger } from '../common/logging';
import swaggerJsdoc from 'swagger-jsdoc';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

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
      doc = yaml.load(fs.readFileSync(path.join(__dirname, '../api.yaml'), 'utf8'));
    } catch (e) {
      doc = null;
      console.log(e);
    }
    return doc;
  }
}