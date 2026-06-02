const http = require('http');
const https = require('https');

function getUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    bodyLength: data.length,
                    title: (data.match(/<title>([^<]+)<\/title>/i) || [])[1],
                    h1: (data.match(/<h1>([^<]+)<\/h1>/i) || [])[1],
                    h2: (data.match(/<h2>([^<]+)<\/h2>/i) || [])[1],
                });
            });
        }).on('error', reject);
    });
}

async function main() {
    const targets = [
        'https://crowncare.net/',
        'https://crowncare.net/home.html',
        'https://crowncare-116e4.web.app/',
        'https://crowncare-116e4.web.app/home.html',
        'https://crowncare-marketing-116e4.web.app/',
        'https://crowncare-marketing-116e4.web.app/home.html'
    ];
    for (const url of targets) {
        try {
            const res = await getUrl(url);
            console.log(`URL: ${url}`);
            console.log(`  Status: ${res.status}`);
            console.log(`  Title:  ${res.title}`);
            console.log(`  H1:     ${res.h1}`);
            console.log(`  H2:     ${res.h2}`);
            console.log(`  Location Header: ${res.headers.location}`);
            console.log('------------------------------------------------');
        } catch (e) {
            console.error(`Error fetching ${url}:`, e.message);
        }
    }
}

main();
