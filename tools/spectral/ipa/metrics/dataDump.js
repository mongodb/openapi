import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

import { PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import config from './config.js';

let AWSConfig = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME,
  },
};

/**
 * Upload a file to an S3 bucket.
 * @param filePath
 */
async function uploadMetricCollectionDataToS3(filePath = config.defaultMetricCollectionResultsFilePath) {
  const client = new S3Client({
    credentials: {
      accessKeyId: AWSConfig.aws.accessKeyId,
      secretAccessKey: AWSConfig.aws.secretAccessKey,
    },
  });
  const bucketName = AWSConfig.s3.bucketName;
  const formattedDate = new Date().toISOString().split('T')[0];

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: formattedDate,
    Body: await readFile(filePath),
  });

  try {
    const response = await client.send(command);
    console.log(response);
  } catch (caught) {
    if (caught instanceof S3ServiceException && caught.name === 'EntityTooLarge') {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(`Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`);
    } else {
      throw caught;
    }
  }
}

const args = process.argv.slice(2);
const filePath = args[0];

//If the config is not populated by the Github Action env variables
if (existsSync('.env') && !AWSConfig.s3.bucketName) {
  dotenv.config();
  AWSConfig = {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    s3: {
      bucketName: process.env.S3_BUCKET_NAME,
    },
  };
}

uploadMetricCollectionDataToS3(filePath)
  .then(() => console.log('Data dump to S3 completed successfully.'))
  .catch((error) => console.error(error.message));
