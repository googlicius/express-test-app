const mongoose = require('mongoose');
const { DB_CONNECTION_STRING } = require('./constants');
const { Schema } = mongoose;

function createFileUploadSchema() {
  const fileUploadSchema = new Schema(
    {
      name: String,
      path: {
        type: String,
        unique: true,
      },
      disk: String,
      formats: JSON,
    },
    {
      timestamps: true,
    },
  );

  return fileUploadSchema;
}

async function main() {
  await mongoose.connect(DB_CONNECTION_STRING);
  console.log(`MongoDB connected.`);
}

main();

module.exports = {
  FileUploadModel: mongoose.model('FileUpload', createFileUploadSchema()),
};
