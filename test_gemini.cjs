const https = require('https');

const API_KEY = "AIzaSyCoFnPkcDpJN9DfEtEaB1SjRVi2E4EBrE8"; // Extracted from AIAssistantWidget.jsx
const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hello" }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`STATUS CODE: ${res.statusCode}`);
    console.log(`RESPONSE: ${body}`);
  });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
