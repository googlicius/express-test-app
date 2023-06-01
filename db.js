const mongoose = require('mongoose');
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
  await mongoose.connect(
    'mongodb://root:root@localhost:27017/express-test-app?authSource=admin',
  );
  console.log(`MongoDB connected.`);
}

main();

module.exports = {
  FileUploadModel: mongoose.model('FileUpload', createFileUploadSchema()),
};
