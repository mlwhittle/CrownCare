const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const keyId = 'CJ43AZ8K98';
const issuerId = '824eeccb-30b9-459e-b19e-f1dd1c2a1ee0';
const privateKey = fs.readFileSync('AuthKey_CJ43AZ8K98.p8', 'utf8');

const header = {
  alg: 'ES256',
  kid: keyId,
  typ: 'JWT'
};

const payload = {
  iss: issuerId,
  exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
  aud: 'appstoreconnect-v1'
};

const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const tokenData = `${encodedHeader}.${encodedPayload}`;

const sign = crypto.createSign('SHA256');
sign.update(tokenData);
sign.end();

// The signature must be raw DER encoded ECDSA signature converted to base64url.
// Node crypto.sign with 'binary' output or 'buffer' output.
// Actually, standard sign() output for ES256 needs to be exactly 64 bytes (R + S).
// Often Node's crypto returns ASN.1 DER wrapper. 
// A fast way is to just do this:
const signature = sign.sign(privateKey);

// JWT requires Raw R|S 64 bytes, NOT ASN.1 DER for ES256. 
// Let's manually parse the ASN.1 sequence for ES256 P-256 (256-bit prime, 32 bytes)
let offset = 2; // skip sequence and length
if (signature[1] > 0x80) offset += signature[1] - 0x80;
// R integer
if (signature[offset] !== 0x02) throw new Error("Expected Integer");
let rLen = signature[offset + 1];
let rBytes = signature.subarray(offset + 2, offset + 2 + rLen);
if (rBytes.length === 33 && rBytes[0] === 0x00) rBytes = rBytes.subarray(1);
offset += 2 + rLen;
// S integer
if (signature[offset] !== 0x02) throw new Error("Expected Integer");
let sLen = signature[offset + 1];
let sBytes = signature.subarray(offset + 2, offset + 2 + sLen);
if (sBytes.length === 33 && sBytes[0] === 0x00) sBytes = sBytes.subarray(1);

// pad with leading zeros to 32 bytes if necessary
const pad = (buf) => {
  if (buf.length >= 32) return buf;
  const target = Buffer.alloc(32);
  buf.copy(target, 32 - buf.length);
  return target;
};

const rsSignature = Buffer.concat([pad(rBytes), pad(sBytes)]);
const encodedSignature = rsSignature.toString('base64url');

const jwt = `${tokenData}.${encodedSignature}`;

console.log("Generated JWT successfully");

const options = {
  hostname: 'api.appstoreconnect.apple.com',
  path: '/v1/apps',
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
