const https = require('https');

https.get('https://api.github.com/repos/phantan379-maker/blockblastAuth/contents/public', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
