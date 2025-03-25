import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { uploadMetricCollectionDataToS3 } from '../../metrics/metricS3Upload.js';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

const testPrefix = 's3://bucket-name/path/to/file';
const testTime = new Date(2020, 3, 1);
const testMetricResultFilePath = path.join(__dirname, 'data', 'expected-metric-results.json');

const clientMock = mockClient(S3Client);
const filePathMock = { bucketName: 'bucket-name', key: 'path/to/file' };

jest.mock('../../metrics/utils/dataDumpUtils.js', () => ({
  ...jest.requireActual('../../metrics/utils/dataDumpUtils.js'),
  getS3FilePath: jest.fn().mockReturnValue(filePathMock),
}));

describe('tools/spectral/ipa/metrics/metricS3Upload.js uploadMetricCollectionDataToS3', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(testTime);
    jest.clearAllMocks();
    clientMock.reset();
    jest.resetModules();
    process.env = {
      AWS_ACCESS_KEY_ID: 'id',
      AWS_SECRET_ACCESS_KEY: 'secret',
      S3_BUCKET_PREFIX: testPrefix,
    };
  });

  it('Outputs the expected metrics collection results', async () => {
    await uploadMetricCollectionDataToS3(testMetricResultFilePath);

    const clientCalls = clientMock.calls();
    expect(clientCalls.length).toEqual(1);

    const putObjectCommand = clientMock.commandCalls(PutObjectCommand);
    expect(putObjectCommand.length).toEqual(1);

    const input = putObjectCommand.at(0).args.at(0).input;
    expect(input['Bucket']).toEqual(filePathMock.bucketName);
    expect(input['Key']).toEqual(
      path.join(filePathMock.key, testTime.toISOString().split('T')[0], 'metric-collection-results.parquet')
    );
    expect(input['Body']).not.toBe(undefined);
  });
});
