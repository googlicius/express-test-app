const express = require('express');
const app = express();
const { default: Storage } = require('@file-storage/core');
const multer = require('multer');
const contentDisposition = require('content-disposition');
const { FileUploadModel } = require('./db');
const { writeStream } = require('./kafka');
const { defaultDiskName } = require('./storage');
const services = require('./services');
const xlsx = require('./xlsx');

require('./agenda');

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
  const fileUpload = await services.upload(
    req.file.buffer,
    req.file.originalname,
    req.body.disk,
  );

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

app.get('/export-excel', async (req, res) => {
  const result = await xlsx.exportExampleFile();
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app; // for testing purposes
