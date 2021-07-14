export interface SFLibraryObject {
  CreatedByName: string;
  CreatedDate: string;
  CreatedTimestamp: number;
  Description: string;
  DisplayPath: string;
  HasPreview: boolean;
  Id: string;
  IsFolder: boolean;
  ItemType: string;
  ModifiedByName: string;
  ModifiedDate: string;
  ModifiedTimestamp: number;
  ParentId: string;
  ParentPermissions: string;
  Path: string;
  Permissions: string;
  Size: number;
  Title: string;
}


export interface SFLibObjects {
  sfLibObjects: SFLibraryObject[]
}

export interface SFCopyRequest {
  itemToCopy: string
  destinationItemName?: string
  destinationFolderId: string
  conflictResolution: string
}

