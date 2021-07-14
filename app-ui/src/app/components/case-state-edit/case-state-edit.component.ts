import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import _ from 'lodash';

@Component({
  templateUrl: './case-state-edit.component.html',
  styleUrls: ['./case-state-edit.component.scss']
})

export class CaseStateEditComponent implements OnInit {

  public stateImageNames = [
    'Added',
    'Archived',
    'Not ready',
    'Process mining',
    'Purged',
    'Ready'
  ];
  public stateImagePaths: string[] = [];

  public stateColors = [
    '#E0F0F9',
    '#FEF7EA',
    '#F9E1E4',
    '#E1F7EB',
    '#F4F4F4'
  ];
  readonly otherColor = 'other';
  readonly colorRegex = /^#[0-9a-f]{6}$/i
  public formError = false;

  public caseStateConfig;
  public customColor: string;

  public icon: string;
  public color: string;

  @Output() stateEditSaved: EventEmitter<any> = new EventEmitter();

  constructor(
    public dialogRef: MatDialogRef<CaseStateEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.stateImageNames.forEach(name => {
      this.stateImagePaths.push(['assets/images/states/', name, '.svg'].join(''));
    });

    if (this.data) {
      this.caseStateConfig = this.data.caseStateConfig;
      if (this.caseStateConfig.color) {
        const colorValue = this.caseStateConfig.color.toUpperCase();
        if (!this.stateColors.find(c => c === colorValue)) {
          this.color = this.otherColor;
          this.customColor = colorValue;
        } else {
          this.color = colorValue;
        }
      }
      this.icon = this.caseStateConfig.icon;
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    const values = this.getEditedValues();
    this.stateEditSaved.emit(values);
    this.dialogRef.close();
  }

  private getEditedValues() {
    const values = {
      icon: this.icon,
      color: this.color
    }
    if (this.color === this.otherColor) {
      values.color = this.customColor;
    }
    if (values.color) {
      values.color = values.color.trim().toUpperCase();
    }
    return values;
  }

  changeIcon(event) {
    const value = event.detail.value;
    this.icon = value;
  }

  changeColor(event) {
    const value = event.detail.value;
    if (value) {
      if (this.stateColors.find(c => c === value)) {
        this.color = value;
      } else {
        this.color = this.otherColor;
        this.customColor = (value === this.otherColor ? this.customColor : value);
      }
    }

    if (this.color === this.otherColor && this.customColor && !this.colorRegex.test(this.customColor)) {
      this.formError = true;
    } else {
      this.formError = false;
    }
  }

  handleDisableSaveBtn() {
    const values = this.getEditedValues();
    return this.formError || !values.color || (values.color === this.caseStateConfig.color && values.icon === this.caseStateConfig.icon);
  }

}
