import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AnalyticTemplateUI} from '../../../models_ui/analyticTemplate';
import {TButton} from '../../../models_ui/buttons';
import {CardMode} from '../../../models_ui/configuration';

@Component({
  selector: 'template-card',
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.css']
})
export class TemplateCardComponent implements OnInit, OnChanges {

  @Input() cardConfig: AnalyticTemplateUI;
  @Input() mode: CardMode // mode can be 'copy' or 'select'
  @Output() selected: EventEmitter<{ mode: CardMode, template: AnalyticTemplateUI, event: MouseEvent}> = new EventEmitter<{ mode: CardMode, template: AnalyticTemplateUI, event: MouseEvent}>();

  @Input() highLight: string;
  @Input() isSelected: boolean;

  public typeCSS = 'top_general';
  public glowCSS = ''

  constructor() {
  }

  ngOnInit(): void {
    this.setCSS();
  }

  public optionClicked(mode: CardMode, event: MouseEvent) {
    this.selected.emit({mode, template: this.cardConfig, event});
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setCSS()
  }

  public showSelect = (): boolean => {
    return this.mode === 'select' && !this.isSelected;
  }

  public showCopy = (): boolean => {
    return this.mode === 'copy' || this.mode === 'edit' || this.mode === 'delete';
  }

  public canEditOrDelete = (): boolean => {
    return this.showCopy() && this.cardConfig?.type !== 'General' && this.cardConfig.type !== 'Vertical';
  }

  private setCSS() {
    this.typeCSS = 'top_' + this.cardConfig?.type.toLowerCase().replace(' ', '_');
    if (this.isSelected) {
      this.glowCSS = 'glow_' + this.cardConfig?.type.toLowerCase().replace(' ', '_');
    }
  }
}

