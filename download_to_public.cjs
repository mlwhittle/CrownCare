const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const downloadDir = path.join(__dirname, 'public');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir
  });

  const url = "https://1drv.ms/v/c/b95b348e2594fabe/IQCCNeeAc3iCSaYArufLmpQzAcZZHJordo5Q4WYaIypiJn0?e=3xdysV";
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Locating and clicking Download button...");
  const clicked = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('button, a, span, div'));
    const downloadEl = elements.find(el => {
      const text = el.innerText || el.textContent || "";
      return text.trim() === "Download";
    });
    if (downloadEl) {
      downloadEl.click();
      return true;
    }
    return false;
  });

  console.log("Clicked download button:", clicked);
  if (!clicked) {
    console.error("Could not find download button.");
    await browser.close();
    process.exit(1);
  }

  // Wait for the download to finish (check the download directory for new files)
  console.log("Waiting for download to start and complete...");
  let downloadedFile = null;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const files = fs.readdirSync(downloadDir);
    const mp4Files = files.filter(f => f.endsWith('.mp4') && !f.endsWith('.crdownload'));
    if (mp4Files.length > 0) {
      // Find the most recently modified mp4 file that is not professionals_video.mp4
      const newFiles = mp4Files.filter(f => f !== 'professionals_video.mp4');
      if (newFiles.length > 0) {
        downloadedFile = newFiles[0];
        break;
      }
    }
    console.log(`Polling download directory... (${i+1}/60)`);
  }

  if (downloadedFile) {
    const srcPath = path.join(downloadDir, downloadedFile);
    const destPath = path.join(downloadDir, 'professionals_video.mp4');
    fs.renameSync(srcPath, destPath);
    console.log("SUCCESS! Downloaded and renamed to:", destPath);
  } else {
    console.error("Download timed out or failed.");
  }

  await browser.close();
})();
