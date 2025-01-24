import { existsSync } from 'fs';
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

function loadS3Config() {
  console.log('Loading S3 config...');

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
