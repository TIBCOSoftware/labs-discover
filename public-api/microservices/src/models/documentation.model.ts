export interface Mapdata {
  // controlPanel: ControlPanel;
  // objects: any;
}

export interface ControlPanel {
  owner: ID;
  author: ID;
  version: string;
  title: string;
}

export interface ID {
  id: number;
}

export interface Iactivity {
  [key: string]: any;
}

export interface Iline {
  [key: string]: any;
}

export interface FolderModel {
  parentFolderId: number;
  name: string;
}