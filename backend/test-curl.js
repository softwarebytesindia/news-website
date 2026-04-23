const http = require('http');
require('./server.js');
setTimeout(() => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/category/this-is-a-demo-new-title-lets-check-how-it-works',
    headers: {
      'User-Agent': 'WhatsApp/2.21.12.21 A'
    }
  };
  http.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      // Just print everything that looks like an og tag
      const tags = data.match(/<meta property="og:[^"]+" content="[^"]*" \/>/g);
      console.log('OG TAGS:', tags);
      console.log('Twitter tags:', data.match(/<meta name="twitter:[^"]+" content="[^"]*" \/>/g));
      process.exit(0);
    });
  }).on('error', err => {
    console.error(err.message);
    process.exit(1);
  });
}, 2000);
