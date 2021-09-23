import {notifyUser} from './message';

export function copyToClipBoard(type: string, value: any, messageService) {
  navigator.clipboard.writeText(value).then(() => {
    notifyUser('INFO', type + ' copied to clipboard...', messageService);
  }, (err) => {
    console.error('Async: Could not copy text: ', err);
  });
}

export function getShortMessage(message: string, shortLength = 25) {
  if (message.length > shortLength) {
    return message.substring(0, shortLength) + '...';
  } else {
    return message;
  }
}
