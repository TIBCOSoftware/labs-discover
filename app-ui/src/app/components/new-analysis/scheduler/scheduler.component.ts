import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent implements OnInit {

  constructor() { }
  public runValue = 'only once';
  public runOptions = ['only once', 'recurring'].map(element => { return {label: element, value: element}; })

  public repeatingDayValue = 'every 1 day';
  public repeatingTimeValue = 'every 25 minutes';
  public columnSeparator;
  public customColumnSeparator;

  public showRepeatingOptions = false;
  public showRepeatingValueOptions = false;

  public selectedTime = 'PM'

  public unitSelection = 'minutes';

  ngOnInit(): void {
  }

  public updateRunValue = (event: CustomEvent): void => {
    console.log(event);
    this.runValue = event.detail.value;
  }

  public handleSelection = (event): void => {

  }

  public showRepeatingOptionsMenu = (): void => {
    this.showRepeatingOptions = !this.showRepeatingOptions;
    this.showRepeatingValueOptions = false;
  }

  public showRepeatingValueOptionsMenu = (): void => {
    this.showRepeatingOptions = false;
    this.showRepeatingValueOptions = !this.showRepeatingValueOptions;
  }

  public setColumnSeparator = (event): void => {

  }

  public showRepeatingLine = (): boolean => {
    return this.runValue === 'recurring';
  }
  public myButton = (field: string): string => {
    if (this.selectedTime === field) {
      return 'primary';
    } else {
      return 'secundary';
    }
  }
  public typeUnitButton = (unit: string): string => {
    if (this.unitSelection === unit) {
      return 'primary';
    } else {
      return 'secundary';
    }
  }

  public setUnitButton = (unit: string):void => {
    this.unitSelection = unit;
  }
}
