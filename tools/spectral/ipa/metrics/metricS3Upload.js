import { PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import config from './config.js';
import path from 'path';
import fs from 'node:fs';
import { tableFromJSON, tableToIPC } from 'apache-arrow';
import { getS3Client, getS3FilePath } from './utils/dataDumpUtils.js';

/**
 * Upload IPA product metrics to Data Warehouse S3
 * @param filePath file path to the metrics collection results, uses config.js by default
 */
export async function uploadMetricCollectionDataToS3(filePath = config.defaultMetricCollectionResultsFilePath) {
  console.log('Loading metrics collection data from', filePath);
  const metricsCollectionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (metricsCollectionData === undefined || metricsCollectionData.length === 0) {
    throw new Error('Loaded metrics collection data is empty');
  }

  const table = tableFromJSON(metricsCollectionData);
  if (table === undefined) {
    throw new Error('Unable to transform metrics collection data to table');
  }

  try {
    console.log('Creating S3 Client...');
    const client = getS3Client();
    const formattedDate = new Date().toISOString().split('T')[0];

    console.log('Getting S3 file path...');
    const s3fileProps = getS3FilePath();

    const command = new PutObjectCommand({
      Bucket: s3fileProps.bucketName,
      Key: path.join(s3fileProps.key, formattedDate, 'metric-collection-results.parquet'),
      Body: tableToIPC(table, 'stream'),
    });

    console.log('Dumping data to S3...');
    const response = await client.send(command);
    console.log(response);
    return response;
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
