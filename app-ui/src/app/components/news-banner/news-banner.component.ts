import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MessageTopicService} from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'news-banner',
  templateUrl: './news-banner.component.html',
  styleUrls: ['./news-banner.component.css']
})
export class NewsBannerComponent implements OnInit {

  public banner: string;

  public type: string;

  constructor(protected messageService: MessageTopicService) {
    this.messageService.getMessage('news-banner.topic.message').subscribe(
        (message) => {
          if (message.text && message.text != '' && message.text != 'init') {
            if (!message.text.startsWith('MESSAGE:')) {
              this.type = 'success';
              this.updateBanner(message.text);
            } else {
              const mesObj = JSON.parse(message.text.substring(message.text.lastIndexOf('MESSAGE:') + 8));
              this.type = mesObj.type;
              this.updateBanner(mesObj.message);
            }
          } else {
            if (document.getElementById('fadeout') != null) {
              document.getElementById('fadeout').style.opacity = '0';
            }
          }
        });
  }

  ngOnInit() {
  }

  private updateBanner(text) {
    this.banner = '';
    window.setTimeout(() => {
      this.banner = text;
    });
    if (document.getElementById('fadeout') != null) {
      document.getElementById('fadeout').style.opacity = '1';

      window.setTimeout(() => {
        document.getElementById('fadeout').style.opacity = '0';
      } , 3000);
    }
  }

  handleClose() {
    document.getElementById('fadeout').style.opacity = '0';
  }
}
