const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const keyId = 'CJ43AZ8K98';
const issuerId = '824eeccb-30b9-459e-b19e-f1dd1c2a1ee0';
const privateKey = fs.readFileSync('AuthKey_CJ43AZ8K98.p8', 'utf8');

// Build JWT Header
const header = {
  alg: 'ES256',
  kid: keyId,
  typ: 'JWT'
};

// Build JWT Payload
const payload = {
  iss: issuerId,
  exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
  aud: 'appstoreconnect-v1'
};

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const encodedHeader = base64UrlEncode(JSON.stringify(header));
const encodedPayload = base64UrlEncode(JSON.stringify(payload));
const tokenData = `${encodedHeader}.${encodedPayload}`;

// Sign the JWT
const sign = crypto.createSign('SHA256');
sign.update(tokenData);
sign.end();
const signature = sign.sign(privateKey);
const encodedSignature = signature.toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const jwt = `${tokenData}.${encodedSignature}`;

const options = {
  hostname: 'api.appstoreconnect.apple.com',
  path: '/v1/users',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
