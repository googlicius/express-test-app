const { default: Storage } = require('@file-storage/core');
const { FileUploadModel } = require('./db');
const { defaultDiskName } = require('./storage');
const { getExt } = require('@file-storage/common');

async function upload(data, fileName, diskName = defaultDiskName) {
  const result = await Storage.disk(diskName).put(data, 'upload/' + fileName);

  const fileUpload = await FileUploadModel.create({
    name: result.name,
    path: result.path,
    disk: diskName,
    ...(result.formats && {
      formats: result.formats,
    }),
  });

  return {
    ...fileUpload.toObject(),
    url: Storage.disk(fileUpload.disk).url(encodeURIComponent(fileUpload.path)),
  };
}

async function chunkUpload(data, fileName, reqBody) {
  const path = `upload/${reqBody.dzuuid}.${getExt(fileName)}`;

  // Upload first chunk to new file.
  if (parseInt(reqBody.dzchunkindex) === 0) {
    const result = await Storage.disk(reqBody.disk, {
      uniqueFileName: false,
    }).put(data, path);

    await FileUploadModel.create({
      name: fileName,
      path: result.path,
      disk: reqBody.disk,
    });
  } else {
    // Append chunk to existing file.
    await Storage.disk(reqBody.disk).append(data, path);
  }

  if (
    parseInt(reqBody.dzchunkindex) <
    parseInt(reqBody.dztotalchunkcount) - 1
  ) {
    return {
      message:
        parseInt(reqBody.dzchunkindex) === 0
          ? 'First chunk uploaded'
          : 'Chunk Appended',
    };
  }

  const fileUpload = await FileUploadModel.findOne({ path });

  return {
    ...fileUpload.toObject(),
    url: Storage.disk(fileUpload.disk).url(encodeURIComponent(fileUpload.path)),
  };
}

module.exports = {
  upload,
  chunkUpload,
};
