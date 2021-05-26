import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "action-confirm",
  templateUrl: './yesno-confirmation.component.html',
  styleUrls: ['./yesno-confirmation.component.scss']
})

export class YesnoConfirmationComponent implements OnInit {
  // the message to explain why the action is rejected.
  @Input() rejectMessage: string;
  // the message to ask user if want to continue the action
  @Input() confirmQuestion: string;
  @Input() doable: boolean = false;
  @Input() yesBtnLabel: string;
  @Input() noBtnLabel: string;
  @Input() shown: boolean;
  @Input() type: string;

  @Output() actionConfirmed: EventEmitter<any> = new EventEmitter();

  // @HostListener('window:click', ['$event'])
  // handleClick(event: MouseEvent) {
  //   console.log(this.hostElement);
  //   console.log(event);
  //   if (!this.hostElement.nativeElement.hidden && this.shown && !this.inOverlay(event.target)) {
  //     this.emitAction(false);
  //   }

  //   setTimeout(() => {

  //   }, 1000);
  // }
  
  private inOverlay(el) {
    while (el != null) {
      if (el == document.body) {
        break;
      }

      if (el.id == 'discover-action-confirm') {
        return true;
      }

      el = el.parentNode;
    }

    return false;
  }

  constructor(
    // private hostElement: ElementRef
  ) {}

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