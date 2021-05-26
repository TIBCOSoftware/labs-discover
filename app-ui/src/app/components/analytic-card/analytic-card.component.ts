import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AnalyticTemplateUI} from '../../models/analyticTemplate';
import {TButton} from '../../models/buttons';

@Component({
  selector: 'analytic-card',
  templateUrl: './analytic-card.component.html',
  styleUrls: ['./analytic-card.component.css']
})
export class AnalyticCardComponent implements OnInit, OnChanges {

  @Input() cardConfig: AnalyticTemplateUI;

  @Input() highLight: string;

  @Input() isSelected: boolean;

  // [ngClass]="{'glow-template':  }"

  @Output() templateSelected: EventEmitter<AnalyticTemplateUI> = new EventEmitter<AnalyticTemplateUI>();

  public typeCSS = 'top_general';
  public glowCSS = ''

  constructor() { }

  ngOnInit(): void {
      this.setCSS();
  }

  templateClicked() {
    this.templateSelected.emit(this.cardConfig);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setCSS()
  }

  private setCSS() {
    this.typeCSS = 'top_' + this.cardConfig.type.toLowerCase().replace(' ', '_');
    if(this.isSelected){
      this.glowCSS = 'glow_' + this.cardConfig.type.toLowerCase().replace(' ', '_');
    }
  }


}
