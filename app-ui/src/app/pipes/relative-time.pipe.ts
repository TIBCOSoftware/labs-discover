import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  pure: false
})
export class RelativeTimePipe implements PipeTransform {

    transform(value: number | string, args?: any): any {

      const seconds: number = Math.floor((+new Date() - +new Date(value)) / 1000);
      let interval: number = Math.floor(seconds / 31536000);
      // years
      if (interval >= 1) {
        if (interval === 1) {
          return interval + ' year ago';
        } else {
          return interval + ' years ago';
        }
      }
      // months
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        if (interval === 1) {
          return interval + ' month ago';
        } else {
          return interval + ' months ago';
        }
      }
      // weeks
      interval = Math.floor(seconds / 604800);
      if (interval >= 1) {
        if (interval === 1) {
          return interval + ' week ago';
        } else {
          return interval + ' weeks ago';
        }
      }
      // days
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        if (interval === 1) {
          return ' Yesterday';
        } else {
          return interval + ' days ago';
        }
      }
      // hours
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) {
        if (interval === 1) {
          return interval + ' hour ago';
        } else {
          return interval + ' hours ago';
        }
      }
      // minutes
      interval = Math.floor(seconds / 60);
      if (interval >= 1) {
        if (interval === 1) {
          return interval + ' minute ago';
        } else {
          return interval + ' minutes ago';
        }
      }

      return 'Less than a minute ago...';
    }
  }
