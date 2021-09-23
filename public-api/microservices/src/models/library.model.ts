export interface Session {
  'X-XSRF-TOKEN': string;
  JSESSIONID: string;  
}

export interface Visualisation {
  "Id": string;
  "Title": string;
  "Description": string;
  "CreatedDate": string;
  "CreatedTimestamp": number;
  "CreatedByName": string;
  "ModifiedDate": string;
  "ModifiedTimestamp": number;
  "ModifiedByName": string;
  "IsFolder": boolean;
  "ItemType": string;
  "Size": number;
  "Path": string;
  "ParentId": string;
  "Permissions": string;
  "ParentPermissions": string;
  "HasPreview": boolean;
  "DisplayPath": string;
}
