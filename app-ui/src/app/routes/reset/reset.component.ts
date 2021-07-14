import { HttpHeaderResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageTopicService } from '@tibco-tcstk/tc-core-lib';
import { ApiResponseText, TcDocumentService } from '@tibco-tcstk/tc-liveapps-lib';
import { from, of } from 'rxjs';
import { delay, map, mergeMap } from 'rxjs/operators';
import { ResetAction } from 'src/app/models_ui/configuration';
import { ConfigurationService } from 'src/app/service/configuration.service';

@Component({
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {

  public title: string;
  public subtitle: string;
  public reset: boolean;
  public actions: ResetAction[];

  constructor(
    protected router: Router,
    protected documentService: TcDocumentService,
    protected configService: ConfigurationService,
    protected messageService: MessageTopicService
  ) { }

  ngOnInit(): void {
    this.configService.calculateResetActions(true).then(
      actions => this.actions = actions
    );
  }

  public execute = (): void => {
    let idx = 0;
    this.configService.execute(this.actions).pipe(
      map(response => {
        if (response.analytics || response instanceof ApiResponseText || (response instanceof HttpResponse && response.type === 4)){
          this.actions[idx].done = true;
          idx++;
        }
      })
    ).subscribe({
      complete: () => {
        this.messageService.sendMessage('news-banner.topic.message', 'Reset configuration completed.');
      }
    });
  }
}
