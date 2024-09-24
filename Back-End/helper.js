const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const File = require("./models/File");
const exp = require('constants');

const cloudinary = require('cloudinary').v2;
const BoxSDK = require('box-node-sdk');
const B2 = require('backblaze-b2');
const { default: axios } = require('axios');


// CLOUDINARY
cloudinary.config({
    cloud_name: 'dbzvgpykw',
    api_key: '886482515974563',
    api_secret: 'kSE_LPAxIV3F1ixnFVxorQGXCPg',
});


//BLACKBAZE B2
const b2 = new B2({
    applicationKeyId: 'b7d952807083',
    applicationKey: '005acbe0d544446154a3391064fbe8b1702d1e9f66'
});
let b2BucketId = 'eb97fdb9f552d8b097100813';


// BOX-DEVELOPER
const boxSdk = new BoxSDK({
    clientID: 'wh00c6dr2lgdr1w9046px7s2ge381avd',
    clientSecret: 'jV8GeElHIEf208OsoiKkOQ0t53XZCCzh',
});

const boxClient = boxSdk.getBasicClient('rFACmBOZyynzpjjtkS94kwmhhGiS1zYM');


const splitFileIntoChunks = (filePath, chunkSize) => {
    const fileBuffer = fs.readFileSync(filePath);
    const chunks = [];
    let currentIndex = 0;

    while (currentIndex < fileBuffer.length) {
        const chunk = fileBuffer.slice(currentIndex, currentIndex + chunkSize);
        chunks.push(chunk);
        currentIndex += chunkSize;
    }

    return chunks;
};

// Function to upload chunk to Cloudinary
const uploadChunkToCloudinary = async (chunk, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', public_id: filename },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(chunk);
    });
};

// Function to upload chunk to Box
const uploadChunkToBox = async (chunk, filename) => {
    const stream = Buffer.from(chunk);
    const uploadResponse = await boxClient.files.uploadFile('0', filename, stream);
    return `https://api.box.com/2.0/files/${uploadResponse.entries[0].id}/content`;
};

// Function to upload chunk to Backblaze B2
const uploadChunkToB2 = async (chunk, filename) => {
    await b2.authorize();
    const uploadUrl = await b2.getUploadUrl({ bucketId: b2BucketId });
    const response = await axios.post(uploadUrl.data.uploadUrl, chunk, {
        headers: {
            'Authorization': uploadUrl.data.authorizationToken,
            'Content-Type': 'application/octet-stream',
            'X-Bz-File-Name': filename,
        },
    });

    return response.data.fileId;
};


const distributeChunks = (chunks) => {
    const services = [
      { name: 'Cloudinary', func: uploadChunkToCloudinary },
      { name: 'Box', func: uploadChunkToBox },
      { name: 'Backblaze B2', func: uploadChunkToB2 },
    ];
  
    return chunks.map((chunk, index) => {
      const service = services[index % services.length];
      return { func: service.func, chunk, filename: `chunk_${index}`, service: service.name };
    });
  };

module.exports = { splitFileIntoChunks, distributeChunks };