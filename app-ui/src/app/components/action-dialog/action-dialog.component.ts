import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LaProcessSelection, LiveAppsService, Process} from '@tibco-tcstk/tc-liveapps-lib';
import {CustomFormDefs} from '@tibco-tcstk/tc-forms-lib';
import {delay, retryWhen, take} from 'rxjs/operators';
import {CaseAction} from '@tibco-tcstk/tc-liveapps-lib/lib/models/liveappsdata';

@Component({
    selector: 'app-action-dialog',
    templateUrl: './action-dialog.component.html',
    styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent implements OnInit {

    public bDisabled = false;
    public buttonText = 'Submit Action';
    public ensureText: string;

    public sandboxId: number;
    public appId: string;
    public caseRef: string;
    public actionId: string;

    // private customFormDefs: CustomFormDefs;

    constructor(
        public dialogRef: MatDialogRef<ActionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        protected LAService: LiveAppsService
    ) {
    }

    ngOnInit() {
        this.data.result = 'CANCEL';
        this.appId = this.data.appId;
        this.sandboxId = this.data.sandboxId;
        this.actionId = this.data.actionId;
        this.buttonText = this.data.label;
        this.caseRef = this.data.caseReference;
        this.ensureText = 'Are you sure ?';
    }

    closeDialog = (submitted) => {
        this.dialogRef.close(submitted);
    }

    doSubmitAction() {
        this.bDisabled = true;
        this.buttonText = this.data.label + '...';
        const processID = '0';
        this.LAService.runProcess(this.sandboxId, this.appId, this.actionId, this.caseRef, {}).pipe(
            // retry(3),
            retryWhen(errors => {
                return errors.pipe(
                    delay(2000),
                    take(3)
                );
            }),
            take(1)
        ).subscribe(response => {
                if (response) {
                    if (!response.data.errorMsg) {
                        // parse data to object
                        response.data = JSON.parse(response.data);
                        this.buttonText = 'All Done !! (You can close this window now...)';
                    } else {
                        console.error('Unable to run the action');
                        console.error(response.data.errorMsg);
                    }
                }
            }, error => {
                console.error('Unable to run the action');
                console.error(error);
            }
        );
    }

    handleActionCompleted(submitted) {
        this.closeDialog(submitted);
    }
}
