const http = require('http');
require('./server.js');
setTimeout(() => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/uploads/social/1774060626395-732550861.jpg'
  };
  http.get(options, (res) => {
    let data = Buffer.from([]);
    res.on('data', chunk => data = Buffer.concat([data, chunk]));
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('CONTENT-TYPE:', res.headers['content-type']);
      console.log('SIZE:', data.length);
      process.exit(0);
    });
  }).on('error', err => {
    console.error(err.message);
    process.exit(1);
  });
}, 2000);
