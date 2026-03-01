import type { ImagesDAM } from '../images-dam';

export class R2ImagesDAM implements ImagesDAM {
  private r2: R2Bucket;

  constructor(r2: R2Bucket) {
    this.r2 = r2;
  }

  async upload({
    filename,
    file,
    attachmentId,
  }: {
    filename: string;
    file: File;
    attachmentId: string;
  }) {
    const arrayBuffer = await file.arrayBuffer();

    await this.r2.put(attachmentId, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
  }
}
