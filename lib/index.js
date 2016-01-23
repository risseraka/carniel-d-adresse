const fs = require('fs');
const path = require('path');
const express = require('express');
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200'
});

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(busboy({ immediate: true }));
app.use('/', express.static('public'));

const router = express.Router();

function create(obj, callback) {
  client.create({
    index: 'carniel',
    type: 'contact',
    body: obj,
  }, callback);
}

function update(obj, callback) {
  client.update({
    index: 'carniel',
    type: 'contact',
    id: obj.id,
    body: obj,
  }, callback);
}

router.get('/contacts/:id', (req, res) => {
  console.log(req.params);

  client.get({
    index: 'carniel',
    type: 'contact',
    id: req.params.id,
  }, (err, contact) => {
    if (err) return res.status(500).send(err.message);

    res.json(contact);
  });
});

router.post('/contacts/:id', (req, res) => {
  const contact = req.body;

  create(contact, (err) => {
    if (err) return res.status(500).send(err.message);

    res.json(contact);
  });
});

router.put('/contacts/:id', (req, res) => {
  const contact = req.body;

  update(contact, (err) => {
    if (err) return res.status(500).send(err.message);

    res.json(contact);
  });
});

router.get('/contacts', (req, res) => {
  const file = fs.readFileSync('./public/addressBook.json').toString();
  const contacts = JSON.parse(file);

  const offset = (req.query.offset | 0) || 0;
  const limit = (req.query.limit | 0) || 10;

  res.json({
    size: contacts.length,
    contacts : contacts.slice(offset, offset + limit)
  });
})

app.use('/api', router);

app.get('/api', (req, res) => {
  res.json({
    'contacts': '/contacts'
  });
});

app.post('/upload', (req, res) => {
  if (!req.busboy) {
    return res.status(400).json({
      status: 400,
      message: 'please provide a file'
    });
  }

  req.busboy.on('file', (fieldName, file, fileName) => {
    console.log(fieldName, fileName, file);

    const filePath = path.join('./uploads', fileName);

    console.log('writing to file path:', filePath);

    file
      .pipe(fs.createWriteStream(filePath))
      .on('error', (err) => {
	console.error(err);

	res.status(500).json({
	  status: 500,
	  message: err.message,
	});
      })
      .on('end', () => {
	console.info('finished uploading', fieldName);

	res.status(200).json({
	  status: 200,
	  message: 'OK'
	});
      });
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  next(err);
});

app.listen(8080, () => {
  console.log('Example app listening on port 8080!!');
});
