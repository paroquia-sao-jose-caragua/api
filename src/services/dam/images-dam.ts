export interface ImagesDAM {
  upload(params: {
    filename: string;
    file: File;
    attachmentId: string;
  }): Promise<void>;
}
