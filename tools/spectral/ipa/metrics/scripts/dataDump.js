import { uploadMetricCollectionDataToS3 } from '../metricS3Upload.js';

const args = process.argv.slice(2);
const filePath = args[0];

uploadMetricCollectionDataToS3(filePath)
  .then(() => console.log('Data dump to S3 completed successfully.'))
  .catch((error) => console.error(error.message));
