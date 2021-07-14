import { moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'drag-drop-fields-list',
  templateUrl: './drag-drop-fields-list.component.html',
  styleUrls: ['./drag-drop-fields-list.component.scss']
})
export class DragDropFieldsListComponent implements OnInit {

  @Input() fieldList: any[];
  @Input() listId: string;
  @Input() cdkDropListConnectedTo: string[];
  @Input() previewClass: string;
  @Input() labelAttr: string;
  @Output() listItemDropped: EventEmitter<any> = new EventEmitter();
  @Output() deleteField: EventEmitter<any> = new EventEmitter();
  @Output() editField: EventEmitter<any> = new EventEmitter();
  @Output() clickListItem: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
  }

  tableFieldsDrop(event) {
    this.listItemDropped.emit(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  deleteTableField(index: number) {
    // const deletedFields = this.fieldList.splice(index, 1);
    this.deleteField.emit(index);
  }

  editTableField(event, index: number) {
    this.editField.emit({
      event,
      index
    });
  }

  clickMenuItem(index) {
    this.clickListItem.emit(index);
  }

}
