### Updating test data

To update the test data for a given branch, you can follow the steps below

#### Step 1: Evergreen
- Go to evergreen and find the latest run
- Go to `OPENAPI_GENERATE_SPECS` task
- Go to the files link, then righ click and copy the link for any of the files
- Redact the file name from the link, so you have the task files link

#### Step 2: Update the download_specs.sh script if neeeded
- Check what are the current versions in the environment you want to update
- You can check the available versions for a given env via this [link](https://cloud.mongodb.com/api/openapi/versions)

#### Step 3: Run download_specs.sh script
- With the copied link, run the command `./tools/cli/test/data/split/download_specs.sh <s3_bucket_url>  <env>`

Example
```shell
./tools/cli/test/data/split/download_specs.sh https://<s3_bucket_link>/mms/e6ba3136dbd0be2a81dd4ed21b9e6c470edd4420/24_10_05_23_26_12  dev
```

