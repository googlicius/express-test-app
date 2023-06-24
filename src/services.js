const { default: Storage } = require('@file-storage/core');
const { FileUploadModel } = require('./db');
const { defaultDiskName } = require('./storage');

async function upload(data, fileName, diskName = defaultDiskName) {
  const result = await Storage.disk(diskName).put(data, 'upload/' + fileName);

  return FileUploadModel.create({
    name: result.name,
    path: result.path,
    disk: diskName,
    ...(result.formats && {
      formats: result.formats,
    }),
  });
}

module.exports = {
  upload,
};
