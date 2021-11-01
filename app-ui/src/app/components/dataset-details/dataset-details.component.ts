import {Component, Input, OnInit} from '@angular/core';
import {cloneDeep} from 'lodash-es';
import {Dataset} from '../../backend/model/dataset';
import {getShortMessage, copyToClipBoard} from '../../functions/details';
import {MessageTopicService, TcCoreCommonFunctions} from '@tibco-tcstk/tc-core-lib';
import {Location} from '@angular/common';
import {CatalogService} from 'src/app/backend/api/catalog.service';

@Component({
  selector: 'dataset-details',
  templateUrl: './dataset-details.component.html',
  styleUrls: ['./dataset-details.component.css']
})
export class DatasetDetailsComponent implements OnInit {

  @Input() dataset: Dataset & { filePath: string, datasetid: string };
  @Input() messageLength: number;

  datasetDetail: Dataset & { type: string };

  getShortMessage = getShortMessage;
  copyToClipBoard = copyToClipBoard;

  showError = false;
  errorIcon: string;

  constructor(
    private location: Location,
    private catalogService: CatalogService,
    public msService: MessageTopicService) {
  }

  ngOnInit(): void {
    this.errorIcon = TcCoreCommonFunctions.prepareUrlForStaticResource(this.location, 'assets/svg/error-image-2.svg');
    // TODO: Get the right DateSet model
    // console.log('this.dataset: ', this.dataset)
    this.catalogService.getDataset(this.dataset.datasetid).subscribe(dataset => {
      // console.log('dataset detail: ', dataset);
      this.datasetDetail = cloneDeep(dataset);
    })
  }

}
