import {Component, Input, OnInit} from '@angular/core';
import {cloneDeep} from 'lodash-es';
import {Dataset} from '../../model/dataset';
import {DatasetService} from '../../service/dataset.service';
import {DatasetDetail} from '../../model/datasetDetail';
import {getShortMessage, copyToClipBoard} from '../../functions/details';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from "@angular/common";

@Component({
  selector: 'dataset-details',
  templateUrl: './dataset-details.component.html',
  styleUrls: ['./dataset-details.component.css']
})
export class DatasetDetailsComponent implements OnInit {

  @Input() dataset: Dataset & { filePath: string };
  @Input() messageLength: number;

  datasetDetail: DatasetDetail & { type: string };

  getShortMessage = getShortMessage;
  copyToClipBoard = copyToClipBoard;

  showError = false;
  errorIcon: string;

  constructor(
    private location: Location,
    private datasetService: DatasetService,
    public msService: MessageTopicService) {
  }

  ngOnInit(): void {
    this.errorIcon = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/error-image-2.svg');
    this.datasetService.getDataset(this.dataset.Dataset_Id).subscribe(dataset => {
      this.datasetDetail = cloneDeep(dataset);
    })
  }

}
