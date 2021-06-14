import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'icon-grid',
  templateUrl: './icon-grid.component.html',
  styleUrls: ['./icon-grid.component.css']
})
export class IconGridComponent implements OnInit, OnChanges {

  @Output() selectedIcon: EventEmitter<string> = new EventEmitter<string>();
  @Input() icon: string;
  @Input() iconColor: string;
  @Input() iconGrid: string[][];

  readonly NO_ICON = 'pl-icon-disabled';
  public showIcons = false;

  constructor() { }

  ngOnInit(): void {
    this.update();
  }

  iconSelected(icon) {
    if(icon === this.NO_ICON){
      this.selectedIcon.emit('NO_ICON');
    } else {
      this.selectedIcon.emit(icon);
    }
  }

  update() {
    this.showIcons = false;
    this.iconGrid?.forEach((iconRow => {
      iconRow.forEach( (icon, i, arr) => {
        if(icon === 'NO_ICON') arr[i] = this.NO_ICON;
      })
    }))
    this.showIcons = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

}
