import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}

@Component({
  selector: 'resizable-draggable',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})
export class ResizableDraggableComponent implements OnInit, AfterViewInit {
  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('left') public left: number;
  @Input('top') public top: number;

  @Input('containerTop') public containerTop: number;
  @Input('containerLeft') public containerLeft: number;
  @Input('containerHeight') public containerHeight: number;
  @Input('containerWidth') public containerWidth: number;

  @Input('minHeight') public minHeight: number;
  @Input('minWidth') public minWidth: number;
  @ViewChild("box") public box: ElementRef;

  @Output() enableSFPointerEvents: EventEmitter<boolean> = new EventEmitter<boolean>();
  private boxPosition: { left: number, top: number };
  private containerPos: { left: number, top: number, right: number, bottom: number };
  public mouse: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick: {x: number, y: number, left: number, top: number}

  showResizeHandler = true;

  ngOnInit() {}

  ngAfterViewInit(){
    this.loadBox();
    this.loadContainer();

    this.initMinSize();
  }

  private loadBox(){
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = {left, top};
    console.log('this.boxPosition', this.boxPosition);
  }

  private loadContainer(){
    // const left = this.boxPosition.left - this.left;
    // const top = this.boxPosition.top - this.top;
    const left = this.containerLeft;
    const top = this.containerTop;
    const right = this.containerWidth + this.containerLeft;
    const bottom = this.containerHeight + this.containerTop;
    this.containerPos = { left, top, right, bottom };
    console.log("[loadContainer] this.containerPos: ", this.containerPos);
  }

  private initMinSize() {
    if (!this.minHeight) {
      this.minHeight = 0;
    }
    if (!this.minWidth) {
      this.minWidth = 0;
    }
  }

  public setContainerScope(scope) {
    const left = scope.left;
    const top = scope.top;
    const right = scope.width + left;
    const bottom = scope.height + top;
    this.containerPos = { left, top, right, bottom };
    console.log("[setContainerScope] this.containerPos: ", this.containerPos);
  }

  public startDrag(event) {
    this.loadBox();
    this.setStatus(event, Status.MOVE);
  }

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    console.log('onMouseUp');
    this.setStatus(event, 0);

    this.enableSFPointerEvents.emit(true);
  }

  setStatus(event: MouseEvent, status: number){
    console.log('set status to ' + status);
    if (status == 0) {
      console.log('set status = 0, the mouse up');
    }
    if (status == Status.RESIZE || status == Status.MOVE) {
      console.log('disable the pointer event for spotfire iframe');
      this.enableSFPointerEvents.emit(false);
    }

    if(status === 1) {
      event.stopPropagation();
    }
    else if(status === 2) {
      this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top };
    }
    else {
      this.loadBox();
    }
    this.status = status;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    // console.log('onMouseMove', event);
    // console.log('this.status = ' + this.status);
    this.mouse = { x: event.clientX, y: event.clientY };

    if(this.status === Status.RESIZE) this.resize();
    else if(this.status === Status.MOVE) this.move();
  }

  private mouseInBox() {
    if (this.mouse.x >= this.boxPosition.left && this.mouse.x <= this.boxPosition.left + this.width && this.mouse.y >= this.boxPosition.top && this.mouse.y <= this.boxPosition.top + this.height) {
      return true;
    }
    return false;
  }

  private resize(){
    // console.log('resize')
    if(this.resizeCondMeet()){
      // console.log('meet resize condition, resize');
      this.width = Math.max(Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left : 0, this.minWidth);
      this.height = Math.max(Number(this.mouse.y > this.boxPosition.top) ? this.mouse.y - this.boxPosition.top : 0, this.minHeight);
    }
  }

  public verticalCollapse(newHeight: number) {
    this.showResizeHandler = false;
    return this.changeHeight(newHeight);
  }

  public verticalExpand(newHeight: number) {
    this.showResizeHandler = true;
    return this.changeHeight(newHeight);
  }

  private changeHeight(newHeight: number) {
    const height = this.height;
    this.height = newHeight;

    if (newHeight > height) {
      // the component becomes bigger
      if (newHeight + this.top > this.containerPos.bottom) {
        this.top = this.containerPos.bottom - newHeight;
      }
    }

    return height;
  }


  private resizeCondMeet(){
    return (this.mouse.x < this.containerPos.right && this.mouse.y < this.containerPos.bottom);
  }

  private move(){
    if(this.moveCondMeet()){
      this.left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
      this.top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
    }
  }

  private moveCondMeet(){
    const offsetLeft = this.mouseClick.x - this.boxPosition.left; 
    const offsetRight = this.width - offsetLeft; 
    const offsetTop = this.mouseClick.y - this.boxPosition.top;
    const offsetBottom = this.height - offsetTop;
    const meetMoveCond = (this.mouse.x > this.containerPos.left + offsetLeft && 
      this.mouse.x < this.containerPos.right - offsetRight &&
      this.mouse.y > this.containerPos.top + offsetTop &&
      this.mouse.y < this.containerPos.bottom - offsetBottom);
    // console.log('meet move condition : ', meetMoveCond);
    // console.log('this.mouseClick(x, y) = (' + [this.mouseClick.x, this.mouseClick.y].join(',') + ')');
    // console.log('this.boxPosition(left, top) = (' + [this.boxPosition.left, this.boxPosition.top].join(',') + ')');
    // console.log('this.containerPos(left, right, top, bottom) = (' + [this.containerPos.left, this.containerPos.right, this.containerPos.top, this.containerPos.bottom].join(',') + '); offset(left, right, top, bottom) = (', [offsetLeft, offsetRight, offsetTop, offsetBottom].join(',') + ')');
    return (
      this.mouse.x > this.containerPos.left + offsetLeft && 
      this.mouse.x < this.containerPos.right - offsetRight &&
      this.mouse.y > this.containerPos.top + offsetTop &&
      this.mouse.y < this.containerPos.bottom - offsetBottom
      );
  }
}
