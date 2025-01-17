import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

import { PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import config from './config.js';
import path from 'path';

function loadS3Config() {
  if (existsSync('.env') && !process.env.S3_BUCKET_PREFIX) {
    dotenv.config();
  }
  return {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1',
    },
    s3: {
      prefix: process.env.S3_BUCKET_PREFIX,
    },
  };
}

export function getS3FilePath() {
  const S3Config = loadS3Config();

  const pathParts = S3Config.s3.prefix.replace('s3://', '').split('/');
  const bucketName = pathParts[0];
  let key = pathParts.slice(1).join('/');
  return { bucketName, key };
}

export function getS3Client() {
  const AWSConfig = loadS3Config();

  return new S3Client({
    credentials: {
      accessKeyId: AWSConfig.aws.accessKeyId,
      secretAccessKey: AWSConfig.aws.secretAccessKey,
    },
    region: AWSConfig.aws.region,
  });
}

/**
 * Upload a file to an S3 bucket.
 * @param filePath
 */
export async function uploadMetricCollectionDataToS3(filePath = config.defaultMetricCollectionResultsFilePath) {
  const client = getS3Client();
  const formattedDate = new Date().toISOString().split('T')[0];

  const s3fileProps = getS3FilePath();
  const command = new PutObjectCommand({
    Bucket: s3fileProps.bucketName,
    Key: path.join(s3fileProps.key, formattedDate, 'metric-collection-results.json'),
    Body: await readFile(filePath),
  });

  try {
    const response = await client.send(command);
    console.log(response);
  } catch (caught) {
    if (caught instanceof S3ServiceException && caught.name === 'EntityTooLarge') {
      console.error(
        `Error from S3 while uploading object. The object was too large. \
        To upload objects larger than 5GB, use the S3 console (160GB max) or the multipart upload API (5TB max).`
      );
      throw caught;
    } else if (caught instanceof S3ServiceException) {
      console.error(`Error from S3 while uploading object.  ${caught.name}: ${caught.message}`);
      throw caught;
    } else {
      throw caught;
    }
  }
}

const args = process.argv.slice(2);
const filePath = args[0];

uploadMetricCollectionDataToS3(filePath)
  .then(() => console.log('Data dump to S3 completed successfully.'))
  .catch((error) => console.error(error.message));
