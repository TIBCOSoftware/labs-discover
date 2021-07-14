import {Component, OnInit, AfterViewInit} from '@angular/core';
import {concatMap, delay, filter, map, repeatWhen, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {DatePipe, Location} from '@angular/common';
import {NoFormComponent} from '../../components/forms/no-form/no-form.component';
import {RepositoryService} from 'src/app/api/repository.service';
import {Observable} from 'rxjs';
import {Analysis} from 'src/app/model/analysis';
import {notifyUser} from '../../functions/message';

@Component({
  selector: 'app-process-analysis',
  templateUrl: './process-analysis.component.html',
  styleUrls: ['./process-analysis.component.css']
})
export class ProcessAnalysisComponent implements OnInit, AfterViewInit {

  private REFRESH_DELAY_MS = 1000;

  cases: any[] = [];
  search = '';
  loading = true;

  noDataIconLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/png/no-data.png');

  statusMap: { [key: string]: any } = {};

  constructor(
    private router: Router,
    private messageService: MessageTopicService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private location: Location,
    private repositoryService: RepositoryService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  public refresh = (): void => {
    this.loading = true;
    this.repositoryService.getAnalysis().pipe(
      map(analysisList => {
        this.cases = analysisList.filter(el => el.metadata.state !== 'Completed').sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
        if (this.cases.length > 0) {
          // start progress query for those who doesn't have status yet
          this.startPollingStatus();
        }
      })
    ).subscribe(
      success => {
        this.loading = false
      },
      error => {
        this.loading = false
      }
    );
  }

  private startPollingStatus() {
    this.stopPollingStatus();

    for (const analysis of this.cases) {
      const analysisId = analysis.id;
      if (analysis.metadata && analysis.metadata.state === 'Process mining') {
        const progress = {
          message: 'Process mining',
          stop: false
        };
        this.pollAnalysisStatus(analysisId, progress).subscribe(
          resp => {
            if (resp.metadata && resp.metadata.state) {
              analysis.metadata = Object.assign({}, resp.metadata);
              analysis.actions = resp.actions;
              progress.stop = true;
              this.statusMap[analysisId] = null;
            } else {
              // stopped by setting progress.stop = true
              progress.message = 'Stopped';
            }
          }
        );
        this.statusMap[analysisId] = progress;
      }
    }
  }

  private pollAnalysisStatus(analysisId: string, progress: any): Observable<Analysis> {
    return this.repositoryService.repositoryAnalysisIdStatusGet(analysisId).pipe(
      repeatWhen(obs => obs.pipe(delay(2000))),
      filter(data => {
        if (data.progression !== 0) {
          progress.percentage = data.progression;
          progress.status = data.message;
        }
        // stop polling status once the progression is 0 or 100
        return progress.stop === true || (data.progression === 0 || data.progression === 100)
      }),
      take(1)
    ).pipe(
      concatMap(resp => {
        return this.repositoryService.getAnalysisDetails(analysisId).pipe(
          repeatWhen(obs => obs.pipe(delay(1000))),
          filter(data => (progress.stop === true || data.metadata.state !== 'Process mining')),
          take(1)
        );
      })
    );
  }

  private stopPollingStatus() {
    for (const analysisId in this.statusMap) {
      if (this.statusMap[analysisId]) {
        this.statusMap[analysisId].stop = true;
      }
    }
    this.statusMap = {};
  }

  public openAnalytics = (id: string): void => {
    this.router.navigate(['/discover/analytics', id]);
  }

  public showNewAnalysis = (): void => {
    this.router.navigate(['/discover/new-analysis']);
  }

  public showTemplates = (): void => {
    this.router.navigate(['/discover/templates']);
  }

  public handleSearch = ($event): void => {
    this.search = $event.detail.value;
  }

  public handleActionSelected = (event): void => {
    if (event.name === 'Rerun') {
      // Send message to clear SF report
      this.messageService.sendMessage('clear-analytic.topic.message', 'OK');
    }
    if (event.name === 'Edit') {
      this.router.navigate(['/discover/edit-analysis', event.analysisId]);
    } else if (event.name === 'change-template') {
      this.router.navigate(['/discover/select-template', event.analysisId]);
    } else if (event.name === 'Purge') {
      // Default dialog
      const dialogRef = this.dialog.open(NoFormComponent, {
        width: '500px',
        height: '300px',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'tcs-style-dialog',
        data: {
          ...event,
          title: event.name,
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.messageService.sendMessage('news-banner.topic.message', event.name + ' successful...');
          window.setTimeout(() => {
            this.refresh();
          }, this.REFRESH_DELAY_MS);
        } else {
          console.log('Dialog Single Action Cancelled...');
        }
      });
    } else {
      this.repositoryService.runAnalysisAction(event.analysisId, event.action).subscribe(
        res => {
          this.refresh();
          this.messageService.sendMessage('news-banner.topic.message', event.name + ' successful...');
        },
        err => notifyUser('ERROR', event.name + ' error...', this.messageService)
      );
    }
  }
}
