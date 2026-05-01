const https = require('https');

https.get('https://raw.githubusercontent.com/phantan379-maker/blockblast3/main/index.tsx', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
