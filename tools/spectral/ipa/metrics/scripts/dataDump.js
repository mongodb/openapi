import { uploadMetricCollectionDataToS3 } from '../metricS3Upload.js';

const args = process.argv.slice(2);
const filePath = args[0];

const response = await uploadMetricCollectionDataToS3(filePath).catch((error) => {
  console.error(error.message);
  process.exit(1);
});

if (!response) {
  console.error('PutObject response is undefined');
  process.exit(1);
}

console.log('Data dump to S3 completed successfully.');
