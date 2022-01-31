import { Service } from "typedi";
import { logger } from "../common/logging";
import { Template } from "../models/templates.model";
import { DiscoverCache } from '../cache/DiscoverCache';

@Service()
export class TemplatesService {

  private DATABASE = 'templates'; 

  constructor (
    protected cache: DiscoverCache
  ) {}

  public getTemplates = async (token: string): Promise<Template[]> => {
    let allTemplates = await Promise.all([this.cache.search(token, this.DATABASE, '*'), this.cache.search('DEFAULT', this.DATABASE, '*')]);
    const subscriptionId = (await this.cache.getClient(token)).globalSubscriptionId;
    const templates = [
      ...allTemplates[0].map(el => JSON.parse(el) as Template), 
      ...allTemplates[1].map(el => {
        const template = JSON.parse(el) as Template;
        template.spotfireLocation = template.spotfireLocation.replace('/<ORGID>/', '/' + subscriptionId + '/');
        return template;
      })
    ];
    return templates;
  }

  public createTemplate = async (token: string, template: Template): Promise<Template> => {
    const id = await this.cache.obtainUUID();
    template.id = id;
    await this.cache.set(token, this.DATABASE, String(id), JSON.stringify(template));
    return template;
  }

  public getTemplate = async (token: string, id: string): Promise<Template> => {
    let template = JSON.parse(await this.cache.get(token, this.DATABASE, id)) as Template;
    // if template doesn't exist it is a default template
    if (!template) {
      template = JSON.parse(await this.cache.get('DEFAULT', this.DATABASE, id)) as Template;
      const subscriptionId = (await this.cache.getClient(token)).globalSubscriptionId;
      template.spotfireLocation = template.spotfireLocation.replace('/<ORGID>/', '/' + subscriptionId + '/');
    }
    return template;
  }

  public updateTemplate = async (token: string, id: string, template: Template): Promise<any> => {
    await this.cache.set(token, this.DATABASE, id, JSON.stringify(template));
    return template;
  }

  public deleteTemplate = async (token: string, id: string): Promise<any> => {
    return this.cache.delete(token, this.DATABASE, id);
  }
}