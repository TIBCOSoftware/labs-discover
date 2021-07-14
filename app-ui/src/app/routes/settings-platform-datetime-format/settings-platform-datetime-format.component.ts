import { Component, OnInit } from '@angular/core';
import { DiscoverConfiguration } from 'src/app/models_ui/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';
import { cloneDeep, isEqual } from 'lodash-es';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import * as ace from 'brace';
import { DateTime } from 'luxon';

@Component({
  templateUrl: './settings-platform-datetime-format.component.html',
  styleUrls: ['./settings-platform-datetime-format.component.css']
})
export class SettingsPlatformDatetimeFormatComponent implements OnInit {

  private discover: DiscoverConfiguration;
  public dateTimeFormats: string;
  public previewValues: string;

  // Brace editor
  aceEditorOptions: any = {
    printMargin: false,
    showGutter: true,
    autoScrollEditorIntoView: true,
    highlightActiveLine: true
  };

  constructor(
    protected configService: ConfigurationService,
    protected messageService: MessageTopicService
  ) { }

  public myScript() {
    console.log("**************** myscript")
  }

  ngOnInit(): void {
    this.handleReset();

    const s1 = ace.edit("formats").session
    const s2 = ace.edit("preview").session
    s1.on('changeScrollTop', function() {
      s2.setScrollTop(s1.getScrollTop())
    });
    s2.on('changeScrollTop', function() {
      s1.setScrollTop(s2.getScrollTop())
    });
  }


  public handleSave = (): void => {
    if (!isEqual(this.discover, this.configService.config.discover)) {
      this.configService.updateDiscoverConfig(this.configService.config.sandboxId, this.configService.config.uiAppId, this.discover, this.discover.id).subscribe(
        _ => {
          this.messageService.sendMessage('news-banner.topic.message', 'Settings saved...');
          this.configService.refresh();
        }
      );
    }
  }

  public handleReset = (): void => {
    this.discover = cloneDeep(this.configService.config.discover);
    this.dateTimeFormats = this.discover.dateTimeFormats?.join('\n');
    this.previewValues = this.calculatePreview(this.discover.dateTimeFormats);
  }

  public handleUpdateDateTimeFormats = (value: string): void => {
    this.discover.dateTimeFormats = value.split('\n');
    if (this.discover.dateTimeFormats[this.discover.dateTimeFormats.length-1] === ''){
      this.discover.dateTimeFormats = this.discover.dateTimeFormats.slice(0, this.discover.dateTimeFormats.length-1)
    }
    this.previewValues = this.calculatePreview(this.discover.dateTimeFormats);
    ace.edit("preview").session.setValue(this.previewValues);
  }

  private calculatePreview = (formats: string[]): string => {
    const preview = formats.map((f: string) => DateTime.fromISO('2020-12-19T13:07:04.054').toFormat(f));

    return preview.join('\n');
  }
}
