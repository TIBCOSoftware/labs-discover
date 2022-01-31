import health from 'koa-ping';
import koa from 'koa';
import fs from 'fs';
import config from 'config';

import { useKoaServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { setupLogging } from './Logging';
import { setupSwagger } from './Swagger';
import { logger } from '../common/logging';
import cors from '@koa/cors';

// Controllers
import { SwaggerController } from '../controllers/SwaggerController';
import { AnalysisController } from '../controllers/AnalysisController';
import { TemplatesController } from '../controllers/TemplatesController';
import { DatasetController } from '../controllers/DatasetController';
import { AssetsStorageOperationsApi, FilesOperationsApi, LoginApi, MetricsApi, MiningDataApi, SparkOneTimeJobApi, SparkPreviewJobApi, SparkScheduledJobApi, TibcoDataVirtualizationApi } from '../api/backend/api';
import { DiscoverCache } from '../cache/DiscoverCache';
import { ConfigurationController } from '../controllers/ConfigurationController';
import { InvestigationController } from '../controllers/InvestigationsController';
import { DocumentationController } from '../controllers/DocumentationController';
import { AccountApi } from '../api/tsc/api';

// Liveapps imports
import { ClaimsApi, GroupsApi, MappingsApi, ParametersApi, SandboxesApi, UserRulesApi, UsersApi } from '../api/liveapps/authorization/api';
import { CasesApi, TypesApi } from '../api/liveapps/casemanagement/api';
import { AttributesApi, LastAccessChangesApi, NotesApi, NotificationsApi, RolesApi, ThreadsApi, TopicsApi } from '../api/liveapps/collaboration/api';
import { LinksApi, StatesApi } from '../api/liveapps/configuration/api';


import { CatalogApi, ConfigurationApi, DocumentationsApi, InvestigationsApi, RepositoryApi, VisualisationApi } from '../api/discover/api';
import { DiagramImagesApi, DiagramsApi, LanguagesApi, MapFoldersApi, MapsApi, ResourceGroupsApi, ResourcesApi, UserAccountsApi } from '../api/nimbus/api';
import { ApplicationsApi, ApplicationVersionsApi, ArtifactsApi, FoldersApi } from '../api/liveapps/contentmanagement/api';
import { AuditEventsApi } from '../api/liveapps/events/api';
import { CaseActionsApi, CaseCreatorsApi } from '../api/liveapps/pageflow/api';
import { InstancesApi, InstanceStatesApi, ProcessesApi } from '../api/liveapps/processmanagement/api';

export class KoaConfig {

  app: koa;

  constructor() {
    this.app = new koa();
    this.app.use(health('/ping'));

    setupSwagger(this.app);
    setupLogging(this.app);
    this.app.use(cors({
      credentials: true
    }));


    this.app.use(async (ctx, next) => {
      if (!ctx.request.header.authorization) {
          ctx.throw(400, 'Authorization header not defined\n');
      }
      await next();
    });

    const redisConnection = this.setCacheConnection();
    this.setServiceInstance(redisConnection).then(
      (kk: any) => {
        logger.debug('Service instance initialized');   
        this.setupControllers();     
      }
    ); 
  }

  // Use Container.set to register service
  async setServiceInstance(redisConnection: DiscoverCache) {
    logger.debug('Setting container');
    logger.debug('Getting microservices endpoints');
    const microservices = ['administration', 'analysis', 'configuration', 'datasets', 'documentation', 'investigation', 'orchestrator', 'orchestrator-local', 'templates', 'liveappsURL', 'spotfireURL', 'nimbusURL'];
    let endpoints = await Promise.all(microservices.map((ms: string) => redisConnection.get('global', 'config', 'config:microservices', ms)));

    if (process.env.LOCAL_MODE && process.env.LOCAL_MODE === 'true'){
      logger.debug('Switching to local mode');
      const newEndpoint = 'http://localhost:' + config.get('ports.http');
      endpoints[microservices.indexOf('datasets')] = newEndpoint;
      endpoints[microservices.indexOf('configuration')] = newEndpoint;
      endpoints[microservices.indexOf('documentation')] = newEndpoint;
      endpoints[microservices.indexOf('investigation')] = newEndpoint;
      endpoints[microservices.indexOf('analysis')] = newEndpoint;
      endpoints[microservices.indexOf('templates')] = newEndpoint;
    }

    // Microservices: for internal calls
    const datasetEndpoint = endpoints[microservices.indexOf('datasets')];
    const configurationEndpoint = endpoints[microservices.indexOf('configuration')];
    const documentationEndpoint = endpoints[microservices.indexOf('documentation')];
    const investigationEndpoint = endpoints[microservices.indexOf('investigation')];
    const analysisEndpoint = endpoints[microservices.indexOf('analysis')];
    const templatesEndpoint = endpoints[microservices.indexOf('templates')];
    Container.set(CatalogApi, new CatalogApi(datasetEndpoint));
    Container.set(ConfigurationApi, new ConfigurationApi(configurationEndpoint));
    Container.set(DocumentationsApi, new DocumentationsApi(documentationEndpoint));
    Container.set(InvestigationsApi, new InvestigationsApi(investigationEndpoint))
    Container.set(RepositoryApi, new RepositoryApi(analysisEndpoint));
    Container.set(VisualisationApi, new VisualisationApi(templatesEndpoint));

    // Backend operations
    const backendEndpoint  = fs.existsSync('/var/run/secrets/kubernetes.io') ? endpoints[microservices.indexOf('orchestrator')] : endpoints[microservices.indexOf('orchestrator-local')];
    Container.set(AssetsStorageOperationsApi, new AssetsStorageOperationsApi(backendEndpoint));
    Container.set(FilesOperationsApi, new FilesOperationsApi(backendEndpoint));
    Container.set(LoginApi, new LoginApi(backendEndpoint));
    Container.set(MetricsApi, new MetricsApi(backendEndpoint));
    Container.set(MiningDataApi, new MiningDataApi(backendEndpoint));
    Container.set(SparkOneTimeJobApi, new SparkOneTimeJobApi(backendEndpoint));
    Container.set(SparkPreviewJobApi, new SparkPreviewJobApi(backendEndpoint));
    Container.set(SparkScheduledJobApi, new SparkScheduledJobApi(backendEndpoint));
    Container.set(TibcoDataVirtualizationApi, new TibcoDataVirtualizationApi(backendEndpoint));

    // TSC operations
    const tscEndpoint  = endpoints[microservices.indexOf('tsc')];
    Container.set(AccountApi, new AccountApi(tscEndpoint));

    const liveappsURL = endpoints[microservices.indexOf('liveappsURL')];
    // LiveApps Authorization operations
    const authorizationLAEndpoint = liveappsURL + '/organisation/v1';
    Container.set(ClaimsApi, new ClaimsApi(authorizationLAEndpoint));
    Container.set(GroupsApi, new GroupsApi(authorizationLAEndpoint));
    Container.set(MappingsApi, new MappingsApi(authorizationLAEndpoint));
    Container.set(ParametersApi, new ParametersApi(authorizationLAEndpoint));
    Container.set(SandboxesApi, new SandboxesApi(authorizationLAEndpoint));
    Container.set(UserRulesApi, new UserRulesApi(authorizationLAEndpoint));
    Container.set(UsersApi, new UsersApi(authorizationLAEndpoint));

    // LiveApps Case Management operations
    const caseManagementLAEndpoint = liveappsURL + '/case/v1';
    Container.set(CasesApi, new CasesApi(caseManagementLAEndpoint));
    Container.set(TypesApi, new TypesApi(caseManagementLAEndpoint));

    // LiveApps Collaboration operations
    const collaborationLAEndpoint = liveappsURL + '/collaboration/v1';
    Container.set(AttributesApi, new AttributesApi(collaborationLAEndpoint));
    Container.set(LastAccessChangesApi, new LastAccessChangesApi(collaborationLAEndpoint));
    Container.set(NotesApi, new NotesApi(collaborationLAEndpoint));
    Container.set(NotificationsApi, new NotificationsApi(collaborationLAEndpoint));
    Container.set(RolesApi, new RolesApi(collaborationLAEndpoint));
    Container.set(ThreadsApi, new ThreadsApi(collaborationLAEndpoint));
    Container.set(TopicsApi, new TopicsApi(collaborationLAEndpoint));
    
    // LiveApps Configuration operations
    const configurationLAEndpoint = liveappsURL + '/collaboration/v1';
    // Container.set(AttributesApi, new AttributesApi(configurationLAEndpoint));   // Commented as the same services are available in Collaboration
    Container.set(LinksApi, new LinksApi(configurationLAEndpoint));
    // Container.set(RolesApi, new RolesApi(configurationLAEndpoint));            // Commented as the same services are available in Collaboration
    Container.set(StatesApi, new StatesApi(configurationLAEndpoint));

    // LiveApps Content Management operations
    const contentManagementLAEndpoint = liveappsURL + '/webresource/v1';
    Container.set(ApplicationsApi, new ApplicationsApi(contentManagementLAEndpoint));
    Container.set(ApplicationVersionsApi, new ApplicationVersionsApi(contentManagementLAEndpoint));
    Container.set(ArtifactsApi, new ArtifactsApi(contentManagementLAEndpoint));
    Container.set(FoldersApi, new FoldersApi(contentManagementLAEndpoint));

    // LiveApps Events operationss
    const eventsLAEndpoint = liveappsURL + '/event/v1';
    Container.set(AuditEventsApi, new AuditEventsApi(eventsLAEndpoint));
    
    // LiveApps Pageflow operations
    const pageflowLAEndpoint = liveappsURL + '/pageflow/v1';
    Container.set(CaseActionsApi, new CaseActionsApi(pageflowLAEndpoint));
    Container.set(CaseCreatorsApi, new CaseCreatorsApi(pageflowLAEndpoint));

    // LiveApps Process Management operations
    const processManagementLAEndpoint = liveappsURL + '/process/v1';
    Container.set(InstancesApi, new InstancesApi(processManagementLAEndpoint));
    Container.set(InstanceStatesApi, new InstanceStatesApi(processManagementLAEndpoint));
    Container.set(ProcessesApi, new ProcessesApi(processManagementLAEndpoint));

    // Spotfire endpoint
    const spotfireURL = endpoints[microservices.indexOf('spotfireURL')];
    Container.set('spotfireURL', spotfireURL);

    // Nimbus operations
    const nimbusEndpoint = endpoints[microservices.indexOf('nimbusURL')];
    Container.set(DiagramImagesApi, new DiagramImagesApi(nimbusEndpoint));
    Container.set(DiagramsApi, new DiagramsApi(nimbusEndpoint));
    Container.set(LanguagesApi, new LanguagesApi(nimbusEndpoint));
    Container.set(MapFoldersApi, new MapFoldersApi(nimbusEndpoint));
    Container.set(MapsApi, new MapsApi(nimbusEndpoint));
    Container.set(ResourceGroupsApi, new ResourceGroupsApi(nimbusEndpoint));
    Container.set(ResourcesApi, new ResourcesApi(nimbusEndpoint));
    Container.set(UserAccountsApi, new UserAccountsApi(nimbusEndpoint));    

    // DiscoverCache
    Container.set(DiscoverCache, new DiscoverCache(process.env.REDIS_HOST as string, Number(process.env.REDIS_PORT as string), new ClaimsApi(authorizationLAEndpoint)));
  }

  setCacheConnection() {
    const redisHost = process.env.REDIS_HOST as string;
    const redisPort = Number(process.env.REDIS_PORT as string);

    logger.info('Set service instance in container ');
    logger.info('    Redis host: ' + redisHost);
    logger.info('    Redis port: ' + redisPort);

    // This redis connection is not using a real connection to LA as it is used to get global properties only
    const redisConnection = new DiscoverCache(redisHost, redisPort, new ClaimsApi());
    return redisConnection;
  }

  setupControllers() {
    let controllers: any[] = [];

    try { 
      if (fs.existsSync('/.dockerenv')) {
        logger.info("Running the micro service in docker container. Will load controllers per configuration.");
        if (process.env.CONTROLLER_ANALYSIS && process.env.CONTROLLER_ANALYSIS === 'ON'){
          controllers = [ ...controllers, AnalysisController ]
        }
        if (process.env.CONTROLLER_TEMPLATES && process.env.CONTROLLER_TEMPLATES === 'ON'){
          controllers = [ ...controllers, TemplatesController ]
        }
        if (process.env.CONTROLLER_CONFIGURATION && process.env.CONTROLLER_CONFIGURATION === 'ON'){
          controllers = [ ...controllers, ConfigurationController ]
        }
        if (process.env.CONTROLLER_DATASETS && process.env.CONTROLLER_DATASETS === 'ON'){
          controllers = [ ...controllers, DatasetController ]
        }
        if (process.env.CONTROLLER_INVESTIGATIONS && process.env.CONTROLLER_INVESTIGATIONS === 'ON'){
          controllers = [ ...controllers, InvestigationController ]
        }
        if (process.env.CONTROLLER_DOCUMENTATION && process.env.CONTROLLER_DOCUMENTATION === 'ON'){
          controllers = [ ...controllers, DocumentationController ]
        }
        if (process.env.CONTROLLER_SWAGGER && process.env.CONTROLLER_SWAGGER === 'ON'){
          controllers = [ SwaggerController, ...controllers ];
        }
      } else {
        // Running locally. Therefore, enable all controllers
        controllers = [ SwaggerController, AnalysisController, TemplatesController, DatasetController, ConfigurationController, InvestigationController, DocumentationController];
      }
    } catch(err) {
      console.error(err)
    }
    if (controllers.length !== 0) {
      const controllersText = controllers.map(el => el.getName());
      logger.info('Controllers enabled: ' + controllersText);
    } else {
      logger.error('No controller has been enabled.');
    }

    useContainer(Container);
    useKoaServer(this.app, {
      controllers: controllers
    });
  }
}