import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {OauthService} from '../../service/oauth.service';
import {TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {HttpClient} from '@angular/common/http';
import {Location} from '@angular/common';

@Component({
  selector: 'help-container',
  templateUrl: './help-container.component.html',
  styleUrls: ['./help-container.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HelpContainerComponent implements OnInit, OnChanges {

  @Input() showHelp: boolean;
  @Input() helpSource: string;

  readonly CLOUD_STARTER_DESCRIPTOR = 'assets/cloud_app_descriptor.json';
  readonly BASE_HELP_URL = 'assets/help/discover/config.json';

  helpSourceToUse = this.BASE_HELP_URL

  public csDescriptor: any;

  constructor(public oauthService: OauthService,
              private http: HttpClient,
              private location: Location) {
  }

  ngOnInit(): void {
    this.http.get(TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, this.CLOUD_STARTER_DESCRIPTOR)).subscribe((csDescriptor: any) => {
      this.csDescriptor = csDescriptor;
     });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.helpSource) {
      this.checkIfHelpExists(this.helpSource)
    }
  }

  private checkIfHelpExists(helpURL: string) {
    if(helpURL.endsWith('/config.json')) {
      const helpBaseURL = helpURL.slice(0, helpURL.lastIndexOf('/config.json'));
      if (helpBaseURL.indexOf('/') > -1) {
        this.http.get(TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, helpURL)).subscribe(_S => {
          this.helpSourceToUse = helpURL
        }, error => {
          if (error.status === 404) {
            // Help could not be found, move one level up
            const newHelpURL = helpBaseURL.slice(0, helpBaseURL.lastIndexOf('/')) + '/config.json';
            this.checkIfHelpExists(newHelpURL)
          }
        })
      } else {
        this.helpSourceToUse = this.BASE_HELP_URL
      }
    } else {
      this.helpSourceToUse = this.BASE_HELP_URL
    }
  }
}
