import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private logger = new Logger(AwsService.name);
  constructor(private configService: ConfigService) {}
  public async uploadFile(file: any, _id: string) {
    const AWS_ACCESS_KEY_ID =
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const AWS_REGION = this.configService.get<string>('AWS_REGION');
    const AWS_BUCKET_NAME = this.configService.get<string>('AWS_BUCKET_NAME');
    const AWS_SECRET_ACCESS_KEY = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const s3 = new AWS.S3({
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    const fileExtension = file.originalname.split('.')[1];
    const urlKey = `${_id}.${fileExtension}`;
    this.logger.log(`urlKey: ${urlKey}`);

    const objectParams = {
      Body: file.buffer,
      Bucket: AWS_BUCKET_NAME,
      Key: urlKey,
    };

    const data = s3
      .putObject(objectParams)
      .promise()
      .then(
        () => {
          return {
            url: `https://${AWS_BUCKET_NAME}.s3-${AWS_REGION}.amazonaws.com/${urlKey}`,
          };
        },
        (error) => {
          this.logger.error(error);
          return error;
        },
      );

    return data;
  }
}
