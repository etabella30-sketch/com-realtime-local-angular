import { Injectable } from '@angular/core';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { FileStorageService } from '../file-storage/file-storage.service';
import { TostbarService } from '../../../../core/services/tost/tostbar.service';
import { selectedfileMDL } from '../../../interfaces/upload.interface';

@Injectable({
  providedIn: 'root'
})
export class FileSelectionService {
  filelistiner: any;
  allfetchingdata: any = [];
  constructor(private readonly store: FileStorageService, private tost: TostbarService) { }

  public fetchFiles(files: NgxFileDropEntry[], refObj?: selectedfileMDL): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.allfetchingdata = [];
      const existsFiles = await this.store.getSelectedFileStorage();
      const maxNode = await this.getMaxNode(existsFiles);
      console.log('%cFetching LIST -' + files.length, 'background:#3498bd;color:white;padding:4px');
      let allfiles = files.filter(m => m.fileEntry.isFile)

      if ((allfiles.length + existsFiles.length) > this.store.maxFiles) {
        this.tost.openSnackBar(`If your upload includes more than ${this.store.maxFiles} documents, please consolidate them into a ZIP file before uploading. This will help you avoid any upload errors due to the file limit.`, 'E', 8000)
        resolve([]);
        return;
      }

      if (!files.length) {
        resolve([]);
        return;
      }

      for (const droppedFile of files) {
        console.log(droppedFile.relativePath);

        if (droppedFile.fileEntry.isFile) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
          fileEntry.file((file: File) => {
            this.allfetchingdata.push({ file: file, fullpath: droppedFile.relativePath });
            this.listienFiles(resolve, existsFiles, maxNode, refObj);
          });
        } else {
          this.allfetchingdata.push({ file: null, fullpath: droppedFile.relativePath });
          this.listienFiles(resolve, existsFiles, maxNode, refObj);
        }
      }

    })

  }


  listienFiles(resolve, existsFiles: selectedfileMDL[], maxNode: any, refObj: selectedfileMDL) {
    try {
      clearTimeout(this.filelistiner);
    } catch (error) { }

    this.filelistiner = setTimeout(() => {
      console.log('%cFetching LIST -' + this.allfetchingdata.length, 'background:#3498bd;color:white;padding:4px');

      let idCounter = maxNode ? maxNode.id + 1 : 1; // existsFiles.length + 1;
      const itemsMap = new Map();
      let result = existsFiles;

      try {
        this.allfetchingdata.forEach(e => {
          let path: any = e.fullpath;
          const components = path.split('/');
          let parentId = refObj ? refObj.id : 0;
          let level = refObj ? refObj.level + 1 : 1;

          components.forEach((component, index) => {
            const isLastComponent = index === components.length - 1;
            const isFolder = !isLastComponent;
            let itemKey = `${parentId}-${component}`;

            if (!itemsMap.has(itemKey)) {
              itemsMap.set(itemKey, idCounter);
              result.push({
                id: idCounter,
                isFolder: isFolder,
                name: component,
                parentId: parentId,
                file: (isFolder ? null : e.file),
                level: level
              });
              idCounter++;
            }

            parentId = itemsMap.get(itemKey);
            level++;
          });
        });
      } catch (error) {
        result = existsFiles || [];
      }

      resolve(result);
    }, 1200);
  }

  getMaxNode(existsFiles: selectedfileMDL[]): Promise<selectedfileMDL> {
    return Promise.resolve(existsFiles.reduce((max, product) => product.id > max.id ? product : max, existsFiles[0]));
  }




  /*  listienFiles(resolve) {
      try {
        clearTimeout(this.filelistiner);
      } catch (error) {
      }
      this.filelistiner = setTimeout(() => {
        let idCounter = 1;
        const itemsMap = new Map();
        let result = [];
        try {
          this.allfetchingdata.forEach(e => {
            let path: any = e.fullpath;
            const components = path.split('/');
            let parentId = 0;
            components.forEach((component, index) => {
              const isLastComponent = index === components.length - 1;
              const isFolder = !isLastComponent;
              let itemKey = `${parentId}-${component}`;
              if (!itemsMap.has(itemKey)) {
                itemsMap.set(itemKey, idCounter);
                result.push({
                  id: idCounter,
                  isFolder: isFolder,
                  name: component,
                  parentId: parentId,
                  file: (isFolder ? null : e.file)
                  // ...(isFolder ? {} : e.file) // Assuming file array is needed for files
                });
                idCounter++;
              }
              parentId = itemsMap.get(itemKey);
            });
          });
        } catch (error) {
          result = [];
        }
        resolve(result);
      }, 1200);
  
    }*/


}
