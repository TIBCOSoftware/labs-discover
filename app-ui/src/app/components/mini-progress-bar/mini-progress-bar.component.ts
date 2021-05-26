import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'mini-progress-bar',
  templateUrl: './mini-progress-bar.component.html',
  styleUrls: ['./mini-progress-bar.component.scss']
})
export class MiniProgressBarComponent {

  @Input() percentage: number;
  @Input() message: string;

  public progressImageLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/progress.jpg');

  constructor(
    protected location: Location,
  ) {
  }

}
