export * from './catalog.service';
import { CatalogService } from './catalog.service';
export * from './repository.service';
import { RepositoryService } from './repository.service';
export * from './visualisation.service';
import { VisualisationService } from './visualisation.service';
export const APIS = [CatalogService, RepositoryService, VisualisationService];
