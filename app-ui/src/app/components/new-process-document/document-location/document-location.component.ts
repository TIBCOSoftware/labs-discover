import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FolderModel } from 'src/app/backend/model/folderModel';
import { MapFolderCollection } from 'src/app/backend/model/mapFolderCollection';
import { MapFolderCollectionBreadcrumbs } from 'src/app/backend/model/mapFolderCollectionBreadcrumbs';
import { MapFolderModel } from 'src/app/backend/model/mapFolderModel';
import { NimbusDocument } from 'src/app/models_ui/nimbus';
import { DocumentationsService } from '../../../backend/api/documentations.service';

@Component({
  selector: 'nimbus-doc-location',
  templateUrl: './document-location.component.html',
  styleUrls: ['./document-location.component.scss']
})
export class NewProcessDocumentLocationComponent implements OnInit {

  @Input() document: NimbusDocument;
  @Output() locationSelected: EventEmitter<any> = new EventEmitter();

  @ViewChild("newFolderInput") newFolderInput: ElementRef;

  folders: MapFolderModel[];
  
  parentFolderId: number;
  breadcrumbs: MapFolderCollectionBreadcrumbs[];
  selectedFolder: MapFolderModel;

  newFolderName: string;
  // whether enter create new folder mode
  // createNewFolder: boolean = false;
  // whether the new folder name is 
  editNewFolderMode: boolean = false;

  constructor(
    protected documentationService: DocumentationsService
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit')
    if (this.document.folder) {
      this.selectedFolder = this.document.folder;
    }
    let parentFolderId = undefined;
    if (this.document.breadcrumbs) {
      this.breadcrumbs = this.document.breadcrumbs;
      parentFolderId = this.breadcrumbs[this.breadcrumbs.length - 1].id;
    }
    this.getFolders(parentFolderId);
  }

  // ngAfterViewInit(): void {
  //   console.log('ngAfterViewInit');
  //   this.folderPath = [];
  //   this.getFolders(this.selectedFolder ? this.selectedFolder.mapFolderId : undefined);
  // }

  // todo: pass the parent folder id to the api
  getFolders(parentFolderId: number, newFolderId?: number) {
    if (parentFolderId) {
      this.documentationService.getFolders(parentFolderId).subscribe((resp: MapFolderCollection) => {
        this.folders = resp.items;
        this.breadcrumbs = resp.breadcrumbs;
        if (newFolderId) {
          this.hoistNewFolder(newFolderId);
        }
      });
    } else {
      this.documentationService.getRootFolders().subscribe(resp => {
        this.folders = resp.items;
        this.breadcrumbs = resp.breadcrumbs;
        if (newFolderId) {
          this.hoistNewFolder(newFolderId);
        }
      });
    }
    
  }

  private hoistNewFolder(newFolderId: number) {
    let index;
    for (let i = 0; i < this.folders.length; i++) {
      if (this.folders[i].mapFolderId === newFolderId) {
        index = i;
        break;
      }
    }

    if (index != null) {
      const deletedFolder = this.folders.splice(index, 1);
      this.folders.unshift(deletedFolder[0]);
    }
  }

  selectFolder(folder: MapFolderModel) {
    this.selectedFolder = folder;
    this.document.folder = folder;

    this.updateSelectedFolder();
  }

  naviToFolder(index: number) {
    // breadcrumbs is slice(1) in html, so here need to add 1 to get the correct parent id
    const parentFolderId = index >= 0? this.breadcrumbs[index+1].id : undefined;
    if (index == -1) {
      this.parentFolderId = undefined;
    } else {
      this.parentFolderId = parentFolderId;
    }

    this.getFolders(parentFolderId);
    this.selectedFolder = null;
    this.updateSelectedFolder();
  }

  goIntoFolder(folder: MapFolderModel, event: Event) {
    event.stopPropagation();
    if (folder && folder.subFolders && folder.subFolders.length > 0) {
      // this.folderPath.push(folder);
      this.getFolders(folder.mapFolderId);
      this.selectedFolder = null;
      this.parentFolderId = folder.mapFolderId;
      this.updateSelectedFolder();
    }
    
  }

  handleUpdate = (event, fieldName) => {

  }

  private updateSelectedFolder = (): void => {
    if (this.selectedFolder) {
      this.document.path = '/' + ['Processes', ... this.breadcrumbs.slice(1).map(folder => folder.name), this.selectedFolder.name].join('/');
      this.document.folder = this.selectedFolder;
      this.document.breadcrumbs = this.breadcrumbs;

      this.locationSelected.emit();
    } else {
      this.locationSelected.emit(undefined);
    }
  }

  public enterCreateNewFolderMode = () => {
    if (!this.editNewFolderMode) {
      this.editNewFolderMode = true;
      setTimeout(() => {
        this.newFolderInput.nativeElement.focus();
      }, 100);
    }
    
  }

  public onFolderNameKeys = ($event) => {
    console.log($event);
  }

  public createNewFolder(folderName: string) {
    this.documentationService.postFolder({
      parentFolderId: this.parentFolderId,
      name: folderName
    } as FolderModel).subscribe((newFolder: MapFolderModel) => {
      this.editNewFolderMode = false;
      this.getFolders(this.parentFolderId, newFolder.mapFolderId);
    }, error => {
      console.log(error);
    });
  }

  public onNewFolderNameEnter(folderName: string) {
    if (folderName && folderName.replace(/\s/g, '') != '') {
      this.createNewFolder(folderName.trim());
    } else {
      this.editNewFolderMode = false;
    }
  }

  public onNewFolderNameBlur(folderName: string) {
    this.onNewFolderNameEnter(folderName);
  }

}
