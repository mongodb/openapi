import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getS3FilePath } from '../../../metrics/utils/dataDumpUtils.js';

describe('tools/spectral/ipa/metrics/utils/dataDumpUtils.js getS3FilePath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = {
      AWS_ACCESS_KEY_ID: 'id',
      AWS_SECRET_ACCESS_KEY: 'secret',
      S3_BUCKET_PREFIX: 's3://bucket-name/path/to/file',
    };
  });

  it('Parses the S3 file path correctly', () => {
    const result = getS3FilePath();
    expect(result['bucketName']).toEqual('bucket-name');
    expect(result['key']).toEqual('path/to/file');
  });
});
