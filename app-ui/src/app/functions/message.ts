import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';


export type Level = 'INFO' | 'WARNING' | 'ERROR';

export function notifyUser(level: Level, message: string, msService: MessageTopicService) {
  if(level === 'INFO') {
    msService.sendMessage('news-banner.topic.message', message);
  } else {
    const mes = {
      type: level,
      message,
    };
    msService.sendMessage('news-banner.topic.message', 'MESSAGE:' + JSON.stringify(mes));
  }
}
