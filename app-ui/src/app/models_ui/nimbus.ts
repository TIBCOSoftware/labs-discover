import { MapFolderCollectionBreadcrumbs } from "../backend/model/mapFolderCollectionBreadcrumbs";
import { MapFolderModel } from "../backend/model/mapFolderModel";

export class NimbusDocument {
  name?: string;
  folder?: MapFolderModel;
  path?: string;
  breadcrumbs?: MapFolderCollectionBreadcrumbs[];
}