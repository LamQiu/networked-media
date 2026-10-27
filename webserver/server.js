let express = require('express');
let http = require('http');

let app = express();

app.use(express.static('public'));

app.get('/test', function (req, res) {
  res.send('Hello World!')
});

app.use('/project3', function (req, res) {
  let options = {
    hostname: '127.0.0.1',
    port: 3003,
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: '127.0.0.1:3003' })
  };

  let proxyReq = http.request(options, function (proxyRes) {
    if (proxyRes.headers.location && proxyRes.headers.location.indexOf('/') === 0) {
      proxyRes.headers.location = '/project3' + proxyRes.headers.location;
    }
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', function () {
    res.statusCode = 502;
    res.end('project3 offline');
  });

  req.pipe(proxyReq);
});

app.listen(80, function () {
  console.log('Example app listening on port 80!')
});
