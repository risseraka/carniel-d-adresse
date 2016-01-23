var express = require('express');

var app = express();

app.use('/', express.static('public'));

var router = express.Router();

router.get('/contacts', (req, res) => {
  res.json({
    contacts: [{}, {}, {}]
  });
})

app.use('/api', router);

app.get('/api', (req, res) => {
  res.json({
    'contacts': '/contacts'
  });
});

app.listen(8080, () => {
  console.log('Example app listening on port 8080!!');
});
