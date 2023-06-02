const express = require('express');
const app = express();
const { default: Storage } = require('@file-storage/core');
const { default: S3Driver } = require('@file-storage/s3');
const { default: LocalDriver } = require('@file-storage/local');
const {
  default: ImageManipulation,
} = require('@file-storage/image-manipulation');
const multer = require('multer');
const contentDisposition = require('content-disposition');
const { FileUploadModel } = require('./db');
const { writeStream } = require('./kafka');

require('./agenda');

const defaultDiskName = 's3';

Storage.config({
  uniqueFileName: true,
  plugins: [ImageManipulation],
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
    },
    {
      driver: LocalDriver,
      name: 'local',
      root: 'storage',
    },
  ],
});

Storage.instance().setupMockS3('bucket');

const PORT = 3000;

app.set('view engine', 'hbs');

app.use('/public', express.static('storage'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', multer().single('file'), async (req, res) => {
  const storage = req.body.disk === 'local' ? Storage.disk('local') : Storage;
  const result = await storage.put(
    req.file.buffer,
    'upload/' + req.file.originalname,
  );

  const fileUpload = await FileUploadModel.create({
    name: result.name,
    path: result.path,
    disk: storage.name,
    formats: result.formats,
  });

  const queued = writeStream.write(JSON.stringify(fileUpload));

  if (queued) {
    console.log('Message is queued');
  }

  res.json(fileUpload);
});

app.get('/file-upload/:path', async (req, res) => {
  try {
    const fileUpload = await FileUploadModel.findOne({ path: req.params.path });

    if (!fileUpload) {
      throw new Error('File not found.');
    }

    const stream = await Storage.disk(fileUpload.disk || defaultDiskName).get(
      fileUpload.path,
    );

    if (req.query.download) {
      res.setHeader('content-disposition', contentDisposition(fileUpload.name));
    }

    stream.pipe(res);
  } catch (error) {
    res.send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app; // for testing purposes
