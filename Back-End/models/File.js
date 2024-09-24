
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  name: String,
  userId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"User"
  },
  chunks: [{ service: String, path: String }],
  chunkSize: Number,
  originalSize: Number,
  checksum: String,
  fileExtension: String
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
