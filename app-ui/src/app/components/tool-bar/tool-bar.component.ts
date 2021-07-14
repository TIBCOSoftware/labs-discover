import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MessageTopicService, RouteAction} from '@tibco-tcstk/tc-core-lib';
import {TButton} from '../../models_ui/buttons';

@Component({
  selector: 'tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit, OnChanges {

  @Input() actionButtons: TButton[];

  @Input() notificationText: string;

  @Input() createNewText: string;

  @Output() toolBarButtonClicked: EventEmitter<TButton> = new EventEmitter<TButton>();

  public newTB: TButton;
  public refreshTB: TButton;
  public showCreateNew: boolean;
  public showNotification: boolean;


  constructor(protected messageService: MessageTopicService) {
  }

  ngOnInit() {
    this.showCreateNew = false;
    if (this.createNewText != null && this.createNewText !== '') {
      this.newTB = {
        id: this.createNewText,
        label: this.createNewText,
        type: 'CREATE'
      };
      this.showCreateNew = true;
    }

    this.refreshTB = {
      id: 'refresh',
      label: 'Refresh',
      type: 'OTHER'
    };
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.notificationText != null && this.notificationText !== '') {
      this.showNotification = true;
    } else {
      this.showNotification = false;
    }
  }

  handleButtonClicked(button: TButton) {
    this.toolBarButtonClicked.emit(button);
  }

}
