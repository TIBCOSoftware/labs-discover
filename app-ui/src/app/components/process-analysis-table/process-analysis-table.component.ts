import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ProcessAnalysis, ProcessMining} from '../../models/ProcessAnalysisModel';
import get = Reflect.get;
import {ConfigurationService} from "../../service/configuration.service";
import {CaseAction, LiveAppsService} from "@tibco-tcstk/tc-liveapps-lib";
import {MessageQueueService, MessageTopicService} from "@tibco-tcstk/tc-core-lib";
import {Subject, Subscription} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'process-analysis-table',
  templateUrl: './process-analysis-table.component.html',
  styleUrls: ['./process-analysis-table.component.scss']
})

export class ProcessAnalysisTableComponent implements OnInit, OnChanges, OnDestroy {

  // TODO:Get the data-type as input for table
  @Input() processAnalyses: any;
  @Input() actions: Map<string, any>;
  @Input() searchTerm: string;

  @Output() caseActionSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() openAnalysis: EventEmitter<string> = new EventEmitter<string>();
  @Output() forceRefresh: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('dt', {static: true}) dt;

  public selectedPAs: ProcessAnalysis[];

  public showPagination: boolean = false;
  public NUMBER_OF_ITEMS_BEFORE_PAGINATION = 50;
  public REFRESH_DELAY_AFTER_ON_DONE_MS = 3000;

  public appId: number;

  cols: any[];

  loading: boolean = true;

  statuses = [
    {label: 'Created', value: 'Created'},
    {label: 'Process Mining', value: 'Process Mining'},
    {label: 'Ready', value: 'Ready'},
    {label: 'Cancelled', value: 'Cancelled'},
    {label: 'Aborted', value: 'Aborted'},
    {label: 'Completed', value: 'Completed'}
  ];

  constructor(protected configService: ConfigurationService,
              protected messageQueueService: MessageQueueService,
              protected messageTopicService: MessageTopicService) {
    // this.messageService.sendMessage('update.analytic.progress', JSON.stringify(event));
  }


  private myTopicSubscription: Subscription = new Subscription();
  private unsubscribe$ = new Subject();

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    if (this.processAnalyses.length > this.NUMBER_OF_ITEMS_BEFORE_PAGINATION) {
      this.showPagination = true;
    }
    this.appId = Number(this.configService.config.discover.analysis.applicationId);

    this.cols = [
      {field: 'Name', header: 'Name'},
      {field: 'Description', header: 'Description'},
      {field: 'ModifiedBy', header: 'Last updated by'},
      {field: 'ModifiedOn', header: 'Last updated on'},
      {field: 'state', header: 'Status'},
    ];
    this.loading = false;
    this.myTopicSubscription.add(this.messageQueueService.getMessage('update.analytic.progress').pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(
      async (message) => {
        if (message && message.text && message.text != 'init') {
          //console.log('Update Message: ', message.text);
          const updateM = message.text;
          //console.log('updateM: ', updateM)
          console.log('[Process Analytics Table] Got Update: ', updateM.message);
          for (let pa in this.processAnalyses) {
            // let pa: ProcessAnalysis = tempPa;
            // console.log(this.processAnalyses[pa].caseReference);
            if (this.processAnalyses[pa].caseReference == updateM.caseRef) {
              let tempPM: ProcessMining = {
                Progress: updateM.progress,
                Timestamp: updateM.timestamp,
                Message: updateM.message,
                Status: updateM.status
              }
              this.processAnalyses[pa].ProcessMining = tempPM;
              if (updateM.progress == 100) {
                this.quote();
                window.setTimeout(() => {
                    this.forceRefresh.emit({});
                }, this.REFRESH_DELAY_AFTER_ON_DONE_MS);
              }
            }
          }
        }
      }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.searchTem?.firstChange) {
      this.dt.filterGlobal(changes.searchTerm.currentValue, 'contains');
    }
  }

  openAnalysisClicked(data) {
    if (data.state === 'Ready' || data.state === 'Archived') {
      this.openAnalysis.emit(data.caseReference);
    }
  }

  public obtainData = (rowData: any, col: any): string => {
    return get(rowData, col);;
  }

  public getToolTip = (field: any, data: any): string => {
    let re = '';
    if (field == 'state') {
      const cellData = data[field];
      if (cellData.trim() == 'Process mining') {
        if (data.ProcessMining && data.ProcessMining.Message) {
          re = data.ProcessMining.Status + '(' + data.ProcessMining.Progress + '%): ' + data.ProcessMining.Message;
          // {{processAnalysis.ProcessMining.Status}}({{processAnalysis.ProcessMining.Progress}}%): {{processAnalysis.ProcessMining.Message}}
        }
      }
    }
    return re;
  }

  public getProgress = (field: any, data: any): string => {
    let re = 100
    if (field == 'state') {
      const cellData = data[field];
      if (cellData.trim() == 'Process mining') {
        re = 10;
        if (data.ProcessMining && data.ProcessMining.Progress) {
          re = data.ProcessMining.Progress;
        }
      }
    }
    return re + '%'
  }

  public getNgClass(field, data) {
    let re = null;
    if (field == 'state') {
      const cellData = data[field];
      //re = 'neutral';
      if (cellData.trim() == 'Not ready') {
        re = '#F9E1E4';
      }
      if (cellData.trim() == 'Ready') {
        re = '#E1F7EB';
      }
      if (cellData.trim() == 'Archived' || cellData.trim() == 'Completed' || cellData.trim() == 'Purged') {
        re = '#F4F4F4';
      }
      if (cellData.trim() == 'Added') {
        re = '#E0F0F9';
      }
      if (cellData.trim() == 'Process mining') {
        re = '#FEF7EA';
      }
    }
    return re;
  }

  public quote() {
    const quotes = [
      "Mining is like a search-and-destroy mission - Stewart Udall",
      "Coal mining is tough. Acting is just tedious - Johnny Knoxville",
      "Writing is like mining for gold in your mind - David Baboulene",
      "Mining is to nature as art market is to culture - Robert Hughes",
      "Mining is a patient game and it always will be - Clive Palmer"];
    this.messageTopicService.sendMessage('news-banner.topic.message', quotes[Math.floor(Math.random() * quotes.length)]);
  }

  public getAction = (rawData): any => {
    if (this.actions.size > 0) {
      const availableActions = this.actions.get(rawData.caseReference);
      const buttons = availableActions.map((element: CaseAction) => {
        return {
          id: element.id,
          label: element.label,
          data: {
            caseReference: rawData.caseReference,
            actionId: element.id,
            label: element.label,
            noData: element.noData
          }
        }
      })
      return {options: buttons}
    } else {
      return {};
    }
  }

  public handleCaseActionSelect = (event): void => {
    this.caseActionSelect.emit(event.detail.data);
  }
}
