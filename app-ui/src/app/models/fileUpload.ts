export interface Upload {
  name: string,
  type: string,
  folderName: string,
  fileSize: number,
  uploaded: number,
  status: string,
  prevUploaded: number,
  speed: number,
  timeStamp: number,
  progress: number
}
