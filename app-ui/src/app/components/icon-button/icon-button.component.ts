import {Component, Input, OnInit} from '@angular/core';
import {TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';

@Component({
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.css']
})
export class IconButtonComponent implements OnInit {

  @Input() text: string;

  @Input() iconLocation: string;

  public realIconLocation: string;

  constructor(private location: Location) {
  }

  ngOnInit() {
    this.realIconLocation = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, this.iconLocation);
  }

}
