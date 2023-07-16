const { default: Storage } = require('@file-storage/core');
const { default: S3Driver } = require('@file-storage/s3');
const { default: LocalDriver } = require('@file-storage/local');
const { default: IM } = require('@file-storage/image-manipulation');
const { PORT } = require('./config');

const defaultDiskName = 's3';

Storage.config({
  uniqueFileName: true,
  plugins: [IM],
  defaultDiskName,
  diskConfigs: [
    {
      driver: S3Driver,
      name: 's3',
      bucketName: 'bucket',
      forcePathStyle: true,
      region: 'ap-southeast-1',
      endpoint: 'http://localhost:4566',
      credentials: {
        accessKeyId: 'faked',
        secretAccessKey: 'faked',
      },
      publicUrl: `http://localhost:${PORT}/file-upload`,
    },
    {
      driver: LocalDriver,
      name: 'local',
      root: 'storage',
      publicUrl: `http://localhost:${PORT}/file-upload`,
    },
  ],
});

Storage.instance().setupMockS3('bucket');

module.exports = {
  defaultDiskName,
};
