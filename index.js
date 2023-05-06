const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs')
const csv = require('csv-parser')

const port = process.env.PORT || 3000;
let currentlyExposedFile = null;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(require('./LoggingMiddleware'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Define the file filter
const fileFilter = function (req, file, cb) {
  if (file.mimetype !== 'text/csv') {
    cb(new Error('Only CSV files are allowed'));
  } else {
    cb(null, true);
  }
};

//const upload = multer({ dest: 'uploads/' });
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const ext = file.mimetype.split("/")[1];
    cb(null, file.originalname);
  },
});
const upload = multer({storage: multerStorage, fileFilter: fileFilter});

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.sendStatus(200);
});

app.post('/delete', (req, res) => {
  let fileName = req.body.fileName;
  // Remove any non-alphanumeric characters except for periods, hyphens, and underscores
  fileName = fileName.replace(/[^a-z\ A-Z0-9-_.]/g, '');
  // Ensure that the file name is not too long
  fileName = fileName.slice(0, 100);

  fs.unlink(`uploads/${fileName}`, (err) => {
    if (err) {
      console.log(`Error deleting file: `,err);
      res.sendStatus(500);
    } else {
      console.log(`Deleted file: ${fileName}`);
      res.sendStatus(200);
    }
  });
});

/// Exposure API endpoints

app.post('/expose', (req, res) => {
  currentlyExposedFile = req.body.fileName;
  console.log(`Exposing file: ${currentlyExposedFile}`);
  res.sendStatus(200);
});

app.post('/unexpose', (req, res) => {
  let fileName = req.body.fileName;
  currentlyExposedFile = null;
  console.log(`Unexposing file: ${fileName}`);
  res.sendStatus(200);
});

app.get('/getexposed', (req, res) => {
  console.log(`Getting exposed file(${currentlyExposedFile})`);
  res.send(currentlyExposedFile);
});

app.get('/getfiles', (req, res) => {
  console.log(`Getting files`);
  // List files from uploads
  fs.readdir('uploads', (err, files) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(files);
    }
  });
});

///////////// Data API endpoints

// Define endpoint to retrieve all records
app.get('/api', (req, res) => {
  if(!currentlyExposedFile) { res.status(404).send(); return; }
  const results = [];
  fs.createReadStream('uploads/'+currentlyExposedFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results)
    });
})

// Define endpoint to retrieve a single record
app.get('/api/:id', (req, res) => {
  if(!currentlyExposedFile) { res.status(404).send(); return; }

  let recordFound = false

  fs.createReadStream('uploads/'+currentlyExposedFile)
    .pipe(csv())
    .on('data', (data) => {
      if (data.timestamp === req.params.id) {
        res.json(data)
        recordFound = true
      }
    })
    .on('end', () => {
      if (!recordFound) {
        res.status(404).send()
      }
    })
})

// Define endpoint to filter records by column value
app.get('/api/filter/:column/:value', (req, res) => {
  if(!currentlyExposedFile) { res.status(404).send(); return; }
  const { column, value } = req.params;
  const filteredRecords = []

  fs.createReadStream('uploads/'+currentlyExposedFile)
    .pipe(csv())
    .on('data', (data) => {
      if ((data[column]).trim() === value) {
        filteredRecords.push(data)
      }
    })
    .on('end', () => {
      res.json(filteredRecords)
    })
})