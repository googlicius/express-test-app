const { default: Storage } = require('@file-storage/core');
const { FileUploadModel } = require('./db');

async function upload(data, fileName, disk = 'local') {
  const storage = disk === 'local' ? Storage.disk('local') : Storage;
  const result = await storage.put(data, 'upload/' + fileName);

  return FileUploadModel.create({
    name: result.name,
    path: result.path,
    disk: storage.name,
    ...(result.formats && {
      formats: result.formats,
    }),
  });
}

module.exports = {
  upload,
};
