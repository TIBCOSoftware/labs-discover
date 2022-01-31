import axios from "axios";
import { Service } from "typedi";
import { DiscoverCache } from "../cache/DiscoverCache";
import { logger } from "../common/logging";
import { Session, Visualisation } from "../models/library.model";

@Service()
export class LibraryService {

  constructor (
    protected cache: DiscoverCache,
    protected spotfireURL: string
  ) {}

  public getItems = async (token: string, type: string): Promise<Visualisation[]> => {
    const settings = await this.callSpotfire(token, this.spotfireURL + '/spotfire/wp/settings', 'GET');
    const rootFolderId = settings.data.rootFolderId;

    const rootFolderInfo = await this.getFolderInfo(token, rootFolderId);
    const folderInfo = await this.getFolderInfo(token, rootFolderInfo.data.Children.filter((folder: any) => folder.IsFolder && folder.Path === '/Teams')[0].Id);

    const teamsInfo = folderInfo.data;
    if (teamsInfo != null){
      const org = (await this.cache.getTokenInformation(token)).globalSubscriptionId;
      const orgFolderId = teamsInfo.Children.filter((el: any) => el.IsFolder && el.Path === ('/Teams/' + org))[0].Id;
      const items = await this.iterateItems(token, orgFolderId, type);
      return items;
    } else {
      logger.error('Teams folder not found');
      return [];
    }
  }

  public copyItem = async (token: string, itemId: string, newName: string, newFolder: string): Promise<any> => {
    const copyItem = {
      itemsToCopy: [itemId],
      destinationFolderId: newFolder,
      conflictResolution: 'KeepBoth'
    }
    const copyResponse = await this.callSpotfire(token, this.spotfireURL + '/spotfire/rest/library/copy', 'POST', copyItem);
    if (newName) {
      return await this.renameItem(token, copyResponse.data[0].Id, newName.slice(newName.lastIndexOf('/') + 1));
    }
  }

  private callSpotfire = async (token: string, url: string, method: string, data?: any): Promise<any> => {
    const session = await this.getSession(token);
    logger.debug('Session: ');
    logger.debug(session);
    if (method === 'GET') {
      return await axios.get(url, 
        {
          headers: { 
            cookie: "JSESSIONID=" + session.JSESSIONID,
            "X-XSRF-TOKEN": session["X-XSRF-TOKEN"],
            referer:  this.spotfireURL.replace('https://', '') + '/spotfire/wp/startPage'
          }
        });
    }

    if (method === 'POST'){
      return await axios.post(url, data,
        {
          headers: { 
            cookie: "JSESSIONID=" + session.JSESSIONID,
            "X-XSRF-TOKEN": session["X-XSRF-TOKEN"],
            referer:  this.spotfireURL.replace('https://', '') + '/spotfire/wp/startPage'
          }
        }
      );
    }
  }

  private iterateItems = async (token: string, baseFolderId: string, type: string): Promise<any> => {
    let re = [];
    const iterateFolder = await this.getFolderInfo(token, baseFolderId);

    for (let itItem of iterateFolder.data.Children){
      if(itItem.ItemType === type){
        re.push(itItem);
      }
      if(itItem.IsFolder) {
        re = re.concat(await this.iterateItems(token, itItem.Id, type));
      }
    }
    return re;
  }

  private getSession = async (token: string): Promise<Session> => {
    logger.debug('Token is: ' + token);
    logger.debug('GET NEW Session from spotfire');
    const response = await axios.get(this.spotfireURL, 
      {
        headers: { 'Authorization': 'Bearer ' + token }
      });

    const session: Session = {
      // @ts-expect-error
      JSESSIONID: /JSESSIONID=(.*?);/g.exec(response.headers['set-cookie'])[1],
      // @ts-expect-error
      'X-XSRF-TOKEN': /XSRF-TOKEN=(.*?);/g.exec(response.headers['set-cookie'])[1],
    }
    return session;
  }

  private getFolderInfo = async (token: string, folderId: string): Promise<any> => {
    const request = {
      "folderId": folderId,
      "types": ["spotfire.folder", "spotfire.dxp", "spotfire.sbdf", "spotfire.mod"]
    };
    return await this.callSpotfire(token, this.spotfireURL + '/spotfire/rest/library/folderInfo', 'POST', request);    
  }

  private renameItem = async (token: string, id: string, title: string): Promise<any> => {
    const renameItem = {
      itemId: id,
      title: title
    }
    return await this.callSpotfire(token, this.spotfireURL + '/spotfire/rest/library/modifyTitle', 'POST', renameItem);
  }
}
