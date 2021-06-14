import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'action-confirm',
  templateUrl: './yesno-confirmation.component.html',
  styleUrls: ['./yesno-confirmation.component.scss']
})

export class YesnoConfirmationComponent implements OnInit {
  // the message to explain why the action is rejected.
  @Input() rejectMessage: string;
  // the message to ask user if want to continue the action
  @Input() confirmQuestion: string;
  @Input() doable = false;
  @Input() yesBtnLabel: string;
  @Input() noBtnLabel: string;
  @Input() shown: boolean;
  @Input() type: string;

  @Output() actionConfirmed: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
  }

  public continue() {
    this.emitAction(true);
  }

  public cancelAction() {
    this.emitAction(false);
  }

  public emitAction(action: boolean) {
    this.actionConfirmed.emit({action});
  }

}
