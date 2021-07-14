import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'error-details',
  templateUrl: './error-details.component.html',
  styleUrls: ['./error-details.component.css']
})
export class ErrorDetailsComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() errorMessage: string;

  @ViewChild('eMessage') private eMessage: ElementRef<HTMLElement>;

  errorMessageHTML: string;
  numberOfLines = 0;
  linesSet = false;

  constructor() { }

  ngOnInit(): void {
    this.convertError();
  }

  convertError() {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const webRegex = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
    this.errorMessageHTML = this.errorMessage.replace(emailRegex,'<span class="elink"><a href="mailto:$1">$1</a></span>');
    this.errorMessageHTML = this.errorMessageHTML.replace(webRegex , '<span class="elink"><a href="$1" target="_blank">$1</a></span>');
    // const el = document.getElementById('emContent');
    window.setTimeout(() => {
      this.setLineNumbers();
    })
  }

  private setLineNumbers() {
    if(this.eMessage && this.eMessage.nativeElement && !this.linesSet) {
      const divHeight = this.eMessage.nativeElement.offsetHeight;
      const lineHeight = 20;
      this.numberOfLines = Math.floor(divHeight / lineHeight);
      this.linesSet = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.convertError();
  }

  ngAfterViewInit(): void {
    this.convertError();
  }

}
