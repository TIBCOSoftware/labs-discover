import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { RepositoryService } from 'src/app/backend/api/repository.service';

@Component({
  templateUrl: './no-form.component.html',
  styleUrls: ['./no-form.component.css']
})
export class NoFormComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<NoFormComponent>,
    protected repositoryService: RepositoryService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  public closeDialog = (submitted: boolean): void => {
    this.dialogRef.close(submitted);
  }

  public executeAction = (): void => {
    this.repositoryService.runAnalysisAction(this.data.analysisId, this.data.action).subscribe(
      res => this.closeDialog(true),
      err => this.closeDialog(false)
    );
  }
}
