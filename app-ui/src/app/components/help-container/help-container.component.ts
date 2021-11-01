import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
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
export class HelpContainerComponent implements OnInit {

  @Input() showHelp: boolean;

  @Input() helpSource: string;

  readonly CLOUD_STARTER_DESCRIPTOR = 'assets/cloud_app_descriptor.json';

  public csDescriptor: any;

  constructor(public oauthService: OauthService,
              private http: HttpClient,
              private location: Location) {
  }

  ngOnInit(): void {
    this.http.get(TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, this.CLOUD_STARTER_DESCRIPTOR)).subscribe((csDescriptor: any) => {
      this.csDescriptor = csDescriptor;
      // this.version = 'Version: <span style="color: black">' + csDescriptor.cloudstarter.version + '</span> Build Date: <span style="color: black">' + csDescriptor.cloudstarter.build_date + '</span>';
    });
  }

}
