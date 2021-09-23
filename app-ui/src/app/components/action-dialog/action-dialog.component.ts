import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-action-dialog',
    templateUrl: './action-dialog.component.html',
    styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent implements OnInit {

    public formData: string[];

    constructor(
        public dialogRef: MatDialogRef<ActionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
        this.formData = this.data.formData.split(':');
    }

    closeDialog = (event) => {
        event.detail.actionName = this.formData[3];
        this.dialogRef.close(event);
    }
}
