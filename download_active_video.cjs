const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let docIdUrl = null;

  // Intercept requests to get active docId/tempauth URL
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    // Intercept when URL contains tempauth (can be encoded as tempauth%3d)
    if (url.includes('tempauth')) {
      docIdUrl = url;
      console.log("FOUND ACTIVE MEDIA URL:", docIdUrl);
    }
    request.continue();
  });

  const url = "https://1drv.ms/v/c/b95b348e2594fabe/IQCCNeeAc3iCSaYArufLmpQzAcZZHJordo5Q4WYaIypiJn0?e=3xdysV";
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  
  // Wait for the video player to load and request media streams
  await new Promise(r => setTimeout(r, 10000));
  await browser.close();

  if (!docIdUrl) {
    console.error("Could not intercept a fresh URL containing tempauth.");
    process.exit(1);
  }

  // Parse docIdUrl to strip out fmp4 parameters if it is a video transcode URL, we want the base item endpoint
  let itemApiUrl = docIdUrl;
  if (itemApiUrl.includes('transform/videotranscode')) {
    const urlObj = new URL(docIdUrl);
    const docIdParam = urlObj.searchParams.get('docId');
    if (docIdParam) {
      itemApiUrl = docIdParam;
      console.log("Extracted Base Item URL from Transcode DocId:", itemApiUrl);
    }
  }

  console.log("Fetching item metadata from:", itemApiUrl);
  https.get(itemApiUrl, (res) => {
    let data = "";
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const downloadUrl = json["@content.downloadUrl"] || json["@microsoft.graph.downloadUrl"];
        if (downloadUrl) {
          console.log("Found direct download URL:", downloadUrl);
          
          const destDir = path.join(__dirname, 'public');
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          const file = fs.createWriteStream(path.join(destDir, 'professionals_video.mp4'));
          console.log("Downloading video to public/professionals_video.mp4...");
          
          const downloadFile = (targetUrl) => {
            https.get(targetUrl, (downloadRes) => {
              if (downloadRes.statusCode >= 300 && downloadRes.statusCode < 400 && downloadRes.headers.location) {
                console.log("Following redirect to:", downloadRes.headers.location);
                downloadFile(downloadRes.headers.location);
              } else {
                downloadRes.pipe(file);
                file.on('finish', () => {
                  file.close();
                  console.log("SUCCESS! Video saved to public/professionals_video.mp4");
                });
              }
            }).on('error', (err) => {
              console.error("Download HTTP error:", err);
            });
          };

          downloadFile(downloadUrl);
        } else {
          console.error("Could not find download URL in JSON metadata. Response was:", data);
        }
      } catch (e) {
        console.error("Error parsing JSON:", e.message);
        console.log("Raw response data:", data);
      }
    });
  }).on('error', (err) => {
    console.error("HTTP request error:", err);
  });
})();
