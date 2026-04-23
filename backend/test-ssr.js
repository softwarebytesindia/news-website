const fs = require('fs');
const html = fs.readFileSync('../frontend/dist/index.html', 'utf8');
const injectedMeta = '<meta property="og:title" content="Test Title" />';
const result = html
  .replace(/<title>[\s\S]*?<\/title>/gi, '')
  .replace(/<meta[^>]*?name="description"[\s\S]*?>/gi, '')
  .replace(/<meta[^>]*?property="og:[^"]+"[\s\S]*?>/gi, '')
  .replace(/<meta[^>]*?name="twitter:[^"]+"[\s\S]*?>/gi, '')
  .replace('</head>', injectedMeta + '\n</head>');
console.log(result);
