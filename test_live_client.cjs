const https = require('https');

const data = JSON.stringify({
  email: 'clienttest@gmail.com',
  name: 'Client Test',
  planType: 'client'
});

const options = {
  hostname: 'us-central1-crowncare-116e4.cloudfunctions.net',
  port: 443,
  path: '/provisionStripeSubscription',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', error => console.error('ERROR:', error));
req.write(data);
req.end();
