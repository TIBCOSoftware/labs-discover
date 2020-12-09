export interface TDVConfig {
  enable: boolean;
  bdsServer: string;
  bdsPort: number;
  username: string;
  password: string;
  jdbcPort: number;
  workers: number;
  k8sEnable: boolean;
  k8sNamespace: string;
  k8sPodName: string;
}

export class DataVirtualizationSite {
    name: string;
    host: string;
    port: number;
    domain: string;
    user: string;
    password: string;
    preview: boolean;
    annotation: string;

    deserialize(input: any) {
      this.name = input[0];
      this.host = input[1];
      this.port = input[2];
      this.domain = input[3];
      this.user = input[4];
      this.password = input[6]
      this.preview = input[8];
      this.annotation = input[5];
      return this;
    }
}

export class DataVirtualizationDatabase {
  id: number
  name: string;
  type: string;
  parentPath: boolean;
  annotation: string;

  deserialize(input: any) {
    this.id = input[0];
    this.name = input[1];
    this.type = input[2];
    this.parentPath = input[3];
    this.annotation = input[4];
    return this;
  }
}

export class DataVirtualizationTable {
  id: number;
  name: string;
  type: string;
  parentPath: string;
  annotation: string
  site: string;
  guid: string;

  deserialize(input: any) {
    this.id = input[0];
    this.name = input[1];
    this.type = input[2];
    this.parentPath = input[3];
    this.annotation = input[4];
    this.site = input[5];
    this.guid = input[6];
    return this;
  }
}

export class DataVirtualizationColumn {
  id: number;
  name: string;
  type: string;
  parentPath: string;
  annotation: string;
  indexType: string;
  dataType: string;
  length: number;
  precision: string;
  scale: string;
  fkName: string;
  pkTableId: string;
  pkTableName: string;
  tableId: number;
  position: number;

  deserialize(input: any) {
    this.id = input[0];
    this.name = input[1];
    this.type = input[2];
    this.parentPath = input[3];
    this.annotation = input[4];
    this.indexType = input[5];
    this.dataType = input[6];
    this.length = input[7];
    this.precision = input[8];
    this.scale = input[9];
    this.fkName = input[10];
    this.pkTableId = input[11];
    this.pkTableName = input[12];
    this.tableId = input[13];
    this.position = input[14];
    return this;
  }
}
