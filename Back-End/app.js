
if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const session = require('express-session');
// const MongoStore=require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const multer = require("multer");
// const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const File = require("./models/File");
const cloudinary = require('cloudinary').v2;
const B2 = require('backblaze-b2');
const axios = require('axios');
const { Redis } = require('@upstash/redis');
const Category = require("./models/Category");
const { Readable } = require('stream');



const app = express();


// Upstash Redis configuration
const redis = new Redis({
url:process.env.REDIS_URL,
token:process.env.REDIS_TOKEN,
});


const upload = multer({ storage: multer.memoryStorage() });


const corsOptions = {
  origin: ['http://localhost:5173', 'https://cloudcascade-1.onrender.com'],
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));



app.use(express.static(path.join(__dirname, '../Front-End/dist'))); // Adjust path as necessary

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// const store=MongoStore.create({
//   mongoUrl:process.env.MONGODB_URL,
//   crypto:{
//      secret:process.env.SESSION_SECRET
//   },
//   touchAfter:24*3600
// });

// store.on("error", (err) => {
//   console.log("Error in Mongo Session Store", err);
// });



const sessionOptions = {
  // store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true
  }
};



app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const dburl =process.env.MONGODB_URL;

mongoose.connect(dburl, {})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Connection error', err);
});

// CLOUDINARY
cloudinary.config({
cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
api_key:process.env.CLOUDINARY_API_KEY,
api_secret:process.env.CLOUDINARY_API_SECRET,
  });


// BACKBLAZE B2
const b2 = new B2({
applicationKeyId:process.env.BLACKBAZE_APPL_KEY_ID,
applicationKey:process.env.BLACKBAZE_APPL_KEY
});
let b2BucketId =process.env.BLACKBAZE_BUCKET_ID;


const splitFileIntoChunks = (fileBuffer, chunkSize) => {
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < fileBuffer.length) {
      const chunk = fileBuffer.slice(currentIndex, currentIndex + chunkSize);
      chunks.push(chunk);
      currentIndex += chunkSize;
  }

  console.log(chunks);
  return chunks; // Return the array of chunks
};



const uploadChunkToCloudinary = async (chunk) => {
  try {
      // Create a Readable stream from the chunk
      const stream = Readable.from(chunk);

      // Use a promise to handle the stream upload process
      const result = await new Promise((resolve, reject) => {
          stream.pipe(
              cloudinary.uploader.upload_stream({ resource_type: 'raw' }, (error, result) => {
                  if (error) {
                      return reject(error);
                  }
                  resolve(result);
              })
          );
      });

      console.log(`Cloudinary result:${result.public_id}`); // Log the public ID for debugging
      return result.public_id; // Return the public ID to store in the database
  } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload chunk to Cloudinary');
  }
};


// ---------------------------------PART1----------------------------------------------------------------

const uploadChunkToB2 = async (chunk, filename) => {
  try {
      await b2.authorize();

      console.log(`Uploading chunk size inside b2 function: ${chunk.length}`);

      const uploadUrlResponse = await b2.getUploadUrl({ bucketId: b2BucketId });
      const uploadUrl = uploadUrlResponse.data.uploadUrl;
      const authorizationToken = uploadUrlResponse.data.authorizationToken;

      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream'; // Default

      switch (ext) {
          case '.mp4':
              contentType = 'video/mp4';
              break;
          case '.avi':
              contentType = 'video/x-msvideo';
              break;
          case '.mkv':
              contentType = 'video/x-matroska';
              break;
          case '.mov':
              contentType = 'video/quicktime';
              break;
      }

      const encodedFileName = encodeURIComponent(filename);

      const response = await axios.post(uploadUrl, chunk, {
          headers: {
              'Authorization': authorizationToken,
              'Content-Type': contentType,
              'X-Bz-File-Name': encodedFileName,
              'X-Bz-Content-Sha1': crypto.createHash('sha1').update(chunk).digest('hex')
          },
      });

      console.log(`b2 stored:${response.data.fileId}`);
      return response.data.fileId;
  } catch (error) {
      console.error('Error uploading to Backblaze B2:', error.response ? error.response.data : error.message);
      throw new Error('Failed to upload chunk to Backblaze B2');
  }
};


const uploadChunkToUpstashRedis = async (chunk, filename) => {
  try {
      const chunkKey = `chunk:${filename}`;
      await redis.set(chunkKey, chunk.toString('base64')); // Store as base64
      console.log(`Chunk stored in Redis with key: ${chunkKey}`);
      return chunkKey; // Return the key for later retrieval
  } catch (error) {
      console.error('Error uploading to Upstash Redis:', error.message);
      throw new Error('Failed to upload chunk to Upstash Redis');
  }
};


let globalChunkIndex = 0;
const distributeChunks = (chunks,orginalFileName) => {
  const services = [
    { name: 'Cloudinary', func: uploadChunkToCloudinary },
    { name: 'Backblaze B2', func: uploadChunkToB2 },
    { name: 'Upstash Redis', func: uploadChunkToUpstashRedis },
  ];

  return chunks.map((chunk) => {
    const service = services[globalChunkIndex % services.length];
    const filename = `chunk_${globalChunkIndex++}_${orginalFileName}`; 
    return { func: service.func, chunk, filename, service: service.name };
  });
};



// ---------------------
app.post("/api/uploadFile", upload.single('fileUpload'), async (req, res) => {
  console.log(req.user);
  const chunkSize = 300 * 1024; // 300 KB
  const chunks = splitFileIntoChunks(req.file.buffer, chunkSize);
  
  const checkSum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
  const fileExtension = path.extname(req.file.originalname);

  const distributeChunk = distributeChunks(chunks, req.file.originalname);

  try {
      // Upload chunks in parallel using Promise.all
      const uploadedChunks = await Promise.all(distributeChunk.map(async (chunkInfo, index) => {
          const { func, chunk, filename, service } = chunkInfo;
          
          console.log(`Uploading chunk ${index + 1} of ${distributeChunk.length}`);
          
          // Upload the chunk
          const uploadedPath = await func(chunk, filename);
          
          return { service, path: uploadedPath };
      }));

      // Save the file metadata and uploaded chunk information in the database
      const file = new File({
          name: req.file.originalname,
          chunks: uploadedChunks,
          chunkSize: chunkSize,
          originalSize: req.file.size,
          checksum: checkSum,
          fileExtension: fileExtension,
          fileCategory: req.body.fileType,
          userId: req.user._id
      });

      await file.save();

      const typeOfFile = req.body.fileType;
      await Category.updateOne({ name: typeOfFile }, { $push: { files: file._id } });

      // Retrieve the updated category with populated file details
      const cat = await Category.find({ name: typeOfFile }).populate('files');

      // Respond with success message
      res.status(201).json({
          message: 'File uploaded and chunked successfully',
          file: cat
      });
  } catch (error) {
      console.error('Error during upload:', error.message);
      res.status(500).send('Error during file upload');
  }
});





app.post('/api/getCategory', async (req, res) => {
  try {
    let data = await Category.find({}).populate("files");
    res.json({ data });
  } catch (error) {
    console.error('Error retrieving categories:', error.message);
    res.status(500).json({ message: 'Error retrieving categories' });
  }
});


//   RETRIEVE FILE---------------------------------------------------------------------------------------------------------------


// -------------------------------

const downloadFromCloudinary = async (publicId) => {
  try {
      // Retrieve chunk metadata from Cloudinary
      const result = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
  
      if (!result || !result.secure_url) {
        throw new Error('Chunk not found in Cloudinary');
      }
  
      const fileUrl = result.secure_url;
      // Fetch the actual file as an array buffer
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      
      // Convert the array buffer to a Buffer object
      const fileBuffer = Buffer.from(response.data);  // Explicit conversion to Buffer
      console.log(`Cloudinary Result as Buffer:`, fileBuffer);
      
      return fileBuffer;
    } catch (error) {
      // Error handling
      if (error.response) {
        console.error('Error retrieving from Cloudinary:', error.response.data);
      } else {
        console.error('Error retrieving from Cloudinary:', error.message);
      }
      throw new Error('Failed to retrieve chunk from Cloudinary');
    }

};


const downloadFromB2 = async (fileId) => {
  const response = await b2.downloadFileById({ fileId, responseType: 'arraybuffer' });
  console.log('B2 Response Size:', response.data.byteLength); // For ArrayBuffer
  const result = Buffer.from(response.data);
  console.log('B2 result size:', result.length);
  return result;
};


// 
  
  const downloadFromRedis = async (key) => {
      try {
          const chunkKey = key; // Use the provided key parameter
          const chunk = await redis.get(chunkKey);
          if (chunk === null) {
              throw new Error('Chunk not found in Upstash Redis');
          }
          let result = Buffer.from(chunk, 'base64');
          console.log('Reddis result:', result);
          return result; // Convert chunk to Buffer for reassembly
      } catch (error) {
          console.error('Error retrieving from Upstash Redis:', error.message);
          throw new Error('Failed to retrieve chunk from Upstash Redis');
      }
  };
  

  
  app.get('/api/retrieveFile/:fileId', async (req, res) => {
    console.log("Download function triggered");
    await b2.authorize();

    try {
        const fileId = req.params.fileId;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Download chunks in parallel
        const assembledChunks = await Promise.all(file.chunks.map(async (chunkInfo, index) => {
            let downloadedChunk;

            console.log(`Downloading chunk ${index + 1} from ${chunkInfo.service}`);

            // Service selection
            switch (chunkInfo.service) {
                case 'Cloudinary':
                    downloadedChunk = await downloadFromCloudinary(chunkInfo.path);
                    break;
                case 'Backblaze B2':
                    downloadedChunk = await downloadFromB2(chunkInfo.path);
                    break;
                case 'Upstash Redis':
                    downloadedChunk = await downloadFromRedis(chunkInfo.path);
                    break;
                default:
                    throw new Error('Unknown service');
            }

            // Log the size of the chunk
            console.log(`Chunk ${index + 1} size: ${downloadedChunk.length} bytes`);

            return downloadedChunk;
        }));

        // Assemble the chunks into the final file buffer
        const assembledFileBuffer = Buffer.concat(assembledChunks);

        // Log the size of the final assembled buffer
        console.log(`Assembled file size: ${assembledFileBuffer.length} bytes`);

        // Optional: Validate checksum to ensure integrity
        const retrievedChecksum = crypto.createHash('sha256').update(assembledFileBuffer).digest('hex');
        console.log(`Expected checksum: ${file.checksum}`);
        console.log(`Retrieved checksum: ${retrievedChecksum}`);

        if (retrievedChecksum !== file.checksum) {
            throw new Error('Checksum mismatch! File may be corrupted.');
        }

        // Send the file to the client
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${file.name}`,
        });

        res.send(assembledFileBuffer);
    } catch (error) {
        console.error('Error during file retrieval:', error.message);
        res.status(500).json({ message: 'Error during file retrieval' });
    }
});


// dlete
app.delete('/api/deleteFile/:id', async (req, res) => {
  const { id } = req.params;
  const { category } = req.query;  // Capture category from query params

  try {
      // Log the file ID and category
      console.log(`File ID: ${id}`);
      console.log(`Category: ${category}`);

      // Update the category by pulling the file from the category's file list
      await Category.updateMany({ name: category }, { $pull: { file: id } });

      // Delete the file from the File collection
      await File.findByIdAndDelete(id);

      // Respond with a success message
      return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
      // Handle errors
      console.error('Error deleting file:', error);
      return res.status(500).json({ error: 'Error deleting file' });
  }
});

  
  
// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        console.log('Login error:', err);
        return res.status(500).json({ message: 'Login failed', error: err.message });
      }

      return res.status(201).json({
        message: 'Signup successful',
        user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email }
      });
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(501).json({ message: 'Signup failed', error: error.message });
  }
});

// Login
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });

    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login failed', error: err.message });
      return res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

// Check if logged in
app.post('/api/isLoggedIn', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false, user: null, message: 'You are not logged in' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});


app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, '../Front-End/dist', 'index.html')); // Adjust path as necessary
});


// Start the server
app.listen(8080, () => {
  console.log("App is listening on port 8080");
});
