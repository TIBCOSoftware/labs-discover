import { Component, OnInit } from '@angular/core';
import { TibcoCloudSplashScreenComponent } from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css']
})
export class SplashScreenComponent extends TibcoCloudSplashScreenComponent implements OnInit {

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
