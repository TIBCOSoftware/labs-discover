import {Injectable} from '@angular/core';
import {EFTLService, MessagingAttribute} from "@tibco-tcstk/tc-messaging-lib";
import {TCM_Message_discover_actions} from '../models_ui/discover';
import {ConfigurationService} from "./configuration.service";
import {MessageQueueService, MessageTopicService} from "@tibco-tcstk/tc-core-lib";
import {DatasourceService} from "./datasource.service";

@Injectable({
  providedIn: 'root'
})


export class MessagingWrapperService {
  public eFTL_URL;
  public eFTL_KEY;
  public eFTL_ClientId = 'discover_actions';
  public eFTL_Durable = 'discover_actions'; // discover_info
  public eFTL_Info_Durable = 'discover_info';

  public connected: boolean = false;

  constructor(protected eftlService: EFTLService,
              protected configService: ConfigurationService,
              protected messageQueueService: MessageQueueService,
              protected messageTopicService: MessageTopicService,
              protected dataSource: DatasourceService) {
    this.connected = false;
    this.eFTL_URL = this.configService.config.discover.messaging.endpoint;
    this.eFTL_KEY = this.configService.config.discover.messaging.key;
    console.log('[MessagingWrapperService] Settings] eFTL_URL: ' + this.eFTL_URL + ' and eFTL_KEY: ' + this.eFTL_KEY);
    this.eFTL_ClientId = this.eFTL_ClientId + this.uuidv4();
    console.log('Random Client ID: ' + this.eFTL_ClientId);
    this.connect();
  }

  private CONNECTION_TRIES = 0;
  private CONNECTION_RETRY_LIMIT = 50;

  public connect() {
    this.CONNECTION_TRIES++;
    // TODO: Change into a pipe
    return (this.eftlService.connect(this.eFTL_URL, this.eFTL_KEY, this.eFTL_ClientId).subscribe(
      (result) => {
        // console.log('EFTL: ' , result);
        if (result == 'Connected') {
          console.log('[MessagingWrapperService] Connected to eFTL (URL: ' + this.eFTL_URL + ')');
          this.connected = true;
          this.subscribeToUpdates();
        }
      },
      error => {
        console.log('[MessagingWrapperService] Caught Connection Error: ', error);
        this.connected = false;
      }));
  }

  public subscribeToUpdates() {
    if (this.connected) {
      this.eftlService.receiveMessage('{"_dest": "' + this.eFTL_Durable + '"}', this.eFTL_Durable).subscribe(
        (event) => {
          console.log('[MessagingWrapperService]  Received eFTL UPDATE Message: ', event);
          // Look at '{"status": "updated"}' --> Analysis ID
          if (event && event.status) {
            if (event.status == "updated") {
              //Is the analysis ID the same as the one that is currently displayed.
              console.log('Message received for Analysis ID: ', event.analysis_id);
              console.log('             Current Analysis ID: ', this.dataSource.getDatasource().datasourceId);
              if (event.analysis_id === this.dataSource.getDatasource().datasourceId) {
                this.messageTopicService.sendMessage('news-banner.topic.message', 'Process Analytic can be refreshed...');
                this.messageTopicService.sendMessage('analytic.can.be.refreshed', 'OK');
              }
            }
          }
        }
      );
      // eFTL_Info_Durable
      this.eftlService.receiveMessage('{"_dest": "' + this.eFTL_Info_Durable + '"}', this.eFTL_Info_Durable).subscribe(
        (event) => {
          console.log('[MessagingWrapperService]  Received eFTL PROGRESS Message: ', event);
          if (event.status == "progress") {
            // console.log('Progress Update Message Received: ', event);
            this.messageQueueService.sendMessage('update.analytic.progress', event);
          }
        }
      );
    } else {
      if (this.CONNECTION_TRIES < this.CONNECTION_RETRY_LIMIT) {
        console.warn('[MessagingWrapperService] Retry Connecting to eFTL: ' + this.CONNECTION_TRIES)
        this.connect();
      }
    }
  }

  public sendDiscoverActionsMessage(message: TCM_Message_discover_actions, mType: string) {
    if (this.connected) {
      // Loop over message
      let attributesToSend: MessagingAttribute[] = new Array<MessagingAttribute>();
      attributesToSend.push({name: '_dest', value: this.eFTL_Durable});
      for (const [key, value] of Object.entries(message)) {
        console.log(`${key}: ${value}`);
        attributesToSend.push({name: key, value: value});
      }

      // TODO: Remove old way
      attributesToSend = [
        {name: '_dest', value: this.eFTL_Durable},
        {name: 'event', value: this.eFTL_Durable},
        {name: 'text', value: JSON.stringify(message)},
      ];

      console.log('[MessagingWrapperService]  Sending eFTL Message: ', message);
      this.eftlService.sendMessage(attributesToSend, this.eFTL_Durable).subscribe(
        (event) => {
          console.log('[MessagingWrapperService]  Message Sent: ', event);
          this.messageTopicService.sendMessage('news-banner.topic.message', mType + ' ' + message.ids.toString() + ' for ' + message.analysis_id + '...');
        });

    } else {
      this.connect();
      // TODO: resend the message
    }
  }

  // TODO: Move to common service
  public uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


}
