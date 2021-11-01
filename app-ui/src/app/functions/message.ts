import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';
import {getShortMessage} from './details';

export type Level = 'INFO' | 'WARNING' | 'ERROR';

export function notifyUser(level: Level, message: string, msService: MessageTopicService) {
  message = getShortMessage(message, 58)
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
