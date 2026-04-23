const https = require('https');
const options = {
  hostname: 'newsdigitalbharat.com',
  port: 443,
  path: '/category/this-is-a-demo-new-title-lets-check-how-it-works',
  headers: {
    'User-Agent': 'WhatsApp/2.21.12.21 A'
  }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    const titleMatch = data.match(/<meta property="og:title"[^>]*>/g);
    const imgMatch = data.match(/<meta property="og:image"[^>]*>/g);
    console.log('OG TITLE:', titleMatch);
    console.log('OG IMAGE:', imgMatch);
    process.exit(0);
  });
}).on('error', err => {
  console.error(err.message);
  process.exit(1);
});
