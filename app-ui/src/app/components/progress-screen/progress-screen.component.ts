import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TcCoreCommonFunctions } from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'progress-screen',
  templateUrl: './progress-screen.component.html',
  styleUrls: ['./progress-screen.component.scss']
})
export class ProgressScreenComponent implements OnInit {

  @Input() message1: string;
  @Input() message2: string;
  @Input() percentage: number;
  @Input() status: string;

  public robotAnimationLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/mp4/loading-animation-robot.mp4');
  public robotAnimationGifLocation: string = TcCoreCommonFunctions.prepareUrlForNonStaticResource(this.location, 'assets/images/gif/robot-animation.gif');

  constructor(
    protected location: Location,
  ) {
  }

  ngOnInit(): void {
  }

}
