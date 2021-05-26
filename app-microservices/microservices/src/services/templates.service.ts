import { Service } from "typedi";
import { logger } from "../common/logging";
import { Template } from "../models/templates.model";
import { DiscoverCache } from '../cache/DiscoverCache';

@Service()
export class TemplatesService {

  private DATABASE = 'templates'; 
  private cache: DiscoverCache;

  constructor (
    liveappsURL: string, 
    redisHost: string, 
    redisPort: number
  ) {
    this.cache = new DiscoverCache(redisHost, redisPort, liveappsURL);
  }

  public getTemplates = async (token: string): Promise<Template[]> => {
    const templates = await this.cache.search(token, this.DATABASE, '*');

    if (templates.length == 0) {
      // TO BE MOVED TO THE ADMINISTRATION UI
      // This is the first time the customer access the templates. Then create the default templates
      const subscriptionId = await this.cache.getSubscriptionName(token);
      const newTemplates = this.templates.map(template => {
        template.spotfireLocation = template.spotfireLocation?.replace('%%SUBSCRIPTION%%', subscriptionId);
        return template;
      })
      await Promise.all(newTemplates.map(template => this.createTemplate(token, template)));
      return this.getTemplates(token);
    }
    
    return templates.map(el => JSON.parse(el) as Template).sort((a, b) => {
      if (a.id  && b.id){
        return a.id  > b.id ? 1 : -1
      } else {
        return 1
      }
    });
  }

  public createTemplate = async (token: string, template: Template): Promise<any> => {
    const id = await this.cache.obtainId('templates');
    template.id = id;
    return this.cache.set(token, this.DATABASE, String(id), JSON.stringify(template));
  }

  public getTemplate = async (token: string, name: number): Promise<Template> => {
    const template = await this.cache.get(token, this.DATABASE, String(name));
    return JSON.parse(template) as Template;
  }

  public updateTemplate = async (token: string, id: number, template: Template): Promise<any> => {
    return this.cache.set(token, this.DATABASE, String(id), JSON.stringify(template));
  }

  public deleteTemplate = async (token: string, name: number): Promise<any> => {
    return this.cache.delete(token, this.DATABASE, String(name));
  }

  private templates: Template[] = [
    {
      "name": "Discovery",
      "type": "General",
      "description": "<p>This template is suited to discover how your processes are executed.</p><p> You expect to find a main process that is followed by a majority of cases, and learn about performance, volumes, outliers....</p>",
      "splash": "assets/tempAT/Discovery.png",
      "spotfireLocation": "/Teams/%%SUBSCRIPTION%%/Discover/main/project_discover_latest",
      "menuConfig": [
        {
          "id": "Overview",
          "label": "Overview",
          "icon": "pl-icon-home",
          "child": [],
          "enabled": true,
          "isDefault": true
        },
        {
          "id": "Variants Overview",
          "label": "Variants",
          "icon": "pl-icon-explore",
          "child": [
            {
              "id": "Top Frequents Variants",
              "label": "Top Frequency",
              "icon": "pl-icon-explore",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Bottom Performance Variants",
              "label": "Bottom Performance",
              "icon": "pl-icon-explore",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Variants Map",
          "label": "Process Map",
          "icon": "pl-icon-support",
          "child": [],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Activities Frequency",
          "label": "Activities",
          "icon": "pl-icon-invite",
          "child": [
            {
              "id": "Activities Performance",
              "label": "Performance",
              "icon": "pl-icon-invite",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Resources",
          "label": "Resources Graph",
          "icon": "pl-icon-community",
          "child": [],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Reference Model",
          "label": "Reference Model",
          "icon": "",
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Compliance",
          "label": "Compliance",
          "icon": "pl-icon-license-agreements",
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Cases",
          "label": "Cases",
          "icon": "pl-icon-app-switcher",
          "child": [
            {
              "id": "Bursts",
              "label": "Bursts",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Viewer",
              "label": "Journeys",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Path",
              "label": "Paths",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Attributes",
              "label": "Attributes",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Audit",
              "label": "Audit",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Filters",
          "label": "Filters",
          "icon": "pl-icon-filter",
          "child": [
            {
              "id": "Filters Activities",
              "label": "Activities",
              "icon": "pl-icon-filter",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Config",
          "label": "DevTools",
          "icon": "pl-icon-maintenance",
          "child": [],
          "enabled": true,
          "isDefault": false
        }
      ],
      "enabled": true,
      "marking": {
        "listenOnMarking": "{\"variants\": [\"variant_id\"], \"uncompliantVariants\": [\"variant_id\"]}",
        "casesSelector": "Cases.variants.variant_id",
        "variantSelector": "Variant.variants.variant_id"
      },
      "previewParameters": "AnalysisId=\"PAM-000000\";&Token=\"@@OAUTH_TOKEN@@\";"
    },
    {
      "name": "Compliance",
      "type": "General",
      "description": "<p>This template is suited to compare execution of your business processes against a reference model.</p><p>You already know the process and set of variants that should be followed, and want to check compliance to policies and rules ....</p>",
      "splash": "assets/tempAT/Compliance.png",
      "spotfireLocation": "/Teams/%%SUBSCRIPTION%%/Discover/main/project_discover_latest",
      "menuConfig": [
        {
          "id": "Overview",
          "label": "Overview",
          "icon": "pl-icon-home",
          "child": [],
          "enabled": true,
          "isDefault": true
        },
        {
          "id": "Variants Overview",
          "label": "Variants",
          "icon": "pl-icon-explore",
          "child": [
            {
              "id": "Top Frequents Variants",
              "label": "Top Frequency",
              "icon": "pl-icon-explore",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Bottom Performance Variants",
              "label": "Bottom Performance",
              "icon": "pl-icon-explore",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Reference Model",
          "label": "Reference Model",
          "icon": "",
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Compliance",
          "label": "Compliance",
          "icon": "pl-icon-license-agreements",
          "enabled": true,
          "isDefault": false
        }
        ],
        "enabled": true,
        "marking": {
          "listenOnMarking": "{\"variants\": [\"variant_id\"], \"uncompliantVariants\": [\"variant_id\"]}",
          "casesSelector": "Cases.variants.variant_id",
          "variantSelector": "Variant.variants.variant_id"
      },
      "previewParameters": "AnalysisId=\"PAM-000000\";&Token=\"@@OAUTH_TOKEN@@\";"
    },
    {
      "name": "Journey",
      "type": "General",
      "description": "<p>This template is suited to analyze individual journeys such as patients in a hospital or customer journeys. </p><p>The challenge in such scenarios is to find the main process using similarities, grouping and other techniques....</p>",
      "splash": "assets/tempAT/Journey.png",
      "spotfireLocation": "/Teams/%%SUBSCRIPTION%%/Discover/main/project_discover_latest",
      "menuConfig": [
        {
          "id": "Overview",
          "label": "Overview",
          "icon": "pl-icon-home",
          "child": [],
          "enabled": true,
          "isDefault": true
        },
        {
          "id": "Cases",
          "label": "Cases",
          "icon": "pl-icon-app-switcher",
          "child": [
            {
              "id": "Bursts",
              "label": "Bursts",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Viewer",
              "label": "Journeys",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Path",
              "label": "Paths",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Attributes",
              "label": "Attributes",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            },
            {
              "id": "Case Audit",
              "label": "Audit",
              "icon": "pl-icon-app-switcher",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Activities Frequency",
          "label": "Activities",
          "icon": "pl-icon-invite",
          "child": [
            {
              "id": "Activities Performance",
              "label": "Performance",
              "icon": "pl-icon-invite",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Resources",
          "label": "Resources Graph",
          "icon": "pl-icon-community",
          "child": [],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Filters",
          "label": "Filters",
          "icon": "pl-icon-filter",
          "child": [
            {
              "id": "Filters Activities",
              "label": "Activities",
              "icon": "pl-icon-filter",
              "enabled": true,
              "isDefault": false
            }
          ],
          "enabled": true,
          "isDefault": false
        },
        {
          "id": "Config",
          "label": "DevTools",
          "icon": "pl-icon-maintenance",
          "child": [],
          "enabled": true,
          "isDefault": false
        }
      ],
      "enabled": true,
      "marking": {
        "listenOnMarking": "{\"variants\": [\"variant_id\"], \"uncompliantVariants\": [\"variant_id\"]}",
        "casesSelector": "Cases.variants.variant_id",
        "variantSelector": "Variant.variants.variant_id"
      },
      "previewParameters": "AnalysisId=\"PAM-000000\";&Token=\"@@OAUTH_TOKEN@@\";"
    }
  ];
}