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
      region: process.env.AWS_REGION,
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

/**
 * Gets an S3 client configured to use AssumeRole credentials
 * @returns {S3Client} Configured S3 client
 */
export function getS3Client() {
  const S3Config = loadS3Config();

  // When running in GitHub Actions with aws-actions/configure-aws-credentials,
  // the SDK will automatically use the credentials from the environment
  return new S3Client({ region: S3Config.aws.region });
}
