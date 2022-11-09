import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from 'env';

@Injectable()
export class AwsService {
  private logger = new Logger(AwsService.name);
  public async uploadFile(file: any, _id: string) {
    const s3 = new AWS.S3({
      region: 'sa-east-1',
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    const fileExtension = file.originalname.split('.').pop();
    const urlKey = `${_id}.${fileExtension}`;
    this.logger.log(`urlKey: ${urlKey}`);
  }
}
