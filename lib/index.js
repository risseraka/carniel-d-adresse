const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const express = require('express');
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const async = require('async');

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200'
});

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(busboy({ immediate: true }));
app.use('/', express.static('public'));

const BASE = 'http://192.99.12.85:8080';

const router = express.Router();

function fetch(id, callback) {
  client.get({
    index: 'carniel',
    type: 'contact',
    id,
  }, callback);
}

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

function destroy(id, callback) {
  client.delete({
    index: 'carniel',
    type: 'contact',
    id,
  }, callback);
}

function format(hit) {
  hit._source.id = hit._id;
  hit._source._links = {
    self: BASE + '/api/contacts/' + hit._id,
    item: BASE + '/api/contacts'
  };
  return hit._source;
}

router.get('/contacts/:id', (req, res) => {
  console.log(req.params);

  fetch(req.params.id, (err, contact) => {
    if (err) return res.status(500).send(err.message);

    res.json(format(contact));
  });
});

router.post('/contacts', (req, res) => {
  const contact = req.body;

  create(contact, (err) => {
    if (err) return res.status(500).send(err.message);

    res.json(contact);
  });
});

router.delete('/contacts/:id', (req, res) => {
  const contact = req.body;

  destroy(req.params.id, (err) => {
    if (err) return res.status(500).send({
      status: 500,
      message: err.message
    });

    res.json({
      sttaus: 200,
      message: 'ok'
    });
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
  const offset = (req.query.offset | 0) || 0;
  const limit = (req.query.limit | 0) || 10;

  client.search({
    index: 'carniel',
    from: offset,
    size: limit,
  }, (err, results) => {
    if (err) {
      return res.status(500).json({
	status: 500,
	message: e.message
      });
    }

    console.log(results);
    const formatted = results.hits.hits.map(hit => format(hit));

    const size = results.hits.total;
    const response = {
      size,
      contacts: formatted,
    };

    console.log(require('util').inspect(req, {depth:0}));

    if (offset + limit < size) {
      response.next = BASE + req.baseUrl + req.url.split('?')[0] + '?' + qs.stringify({
	offset: offset + limit,
	limit
      });
    }

    res.json(response);
  });
  return ;

  const file = fs.readFileSync('./public/addressBook.json').toString();
  const contacts = JSON.parse(file);

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

    const stream = file.pipe(fs.createWriteStream(filePath));

    stream
      .on('error', (err) => {
	console.error(err);

	res.status(500).json({
	  status: 500,
	  message: err.message,
	});
      });

    stream
      .on('finish', () => {
	console.info('finished uploading', fieldName);

	var contacts;

	const data = fs.readFileSync(filePath).toString();

	try {
	  contacts = JSON.parse(data);
	} catch(e) {
	  return res.status(500).json({
	    status: 500,
	    message: 'Wrong format:' + e.message
	  });
	}

	console.log(contacts.length);

	async.map(contacts, (contact, cb) => create(contact, cb), (err) => {
	  if (err) {
	    return res.status(500).json({
	      status: 500,
	      message: e.message
	    });
	  }

	  res.status(200).json({
	    status: 200,
	    message: 'OK',
	    imported: contacts.length
	  });
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
