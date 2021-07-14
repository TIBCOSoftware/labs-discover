import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CaseField } from '../../../models_ui/configuration';

@Component({
  selector: 'edit-field',
  templateUrl: './edit-field.component.html',
  styleUrls: ['./edit-field.component.scss']
})
export class EditFieldComponent implements OnInit {

  @Input() field: CaseField;
  @Output() cancelEdit: EventEmitter<any> = new EventEmitter();
  @Output() saveEdit: EventEmitter<any> = new EventEmitter();

  label: string;

  ngOnInit(): void {
    this.label = this.field.label;
  }

  setFieldLabel(event) {
    this.label = event.detail;
  }

  discardChanges() {
    this.cancelEdit.emit();
  }

  saveField() {
    this.saveEdit.emit({
      label: this.label,
      field: this.field.field
    });
  }

}
