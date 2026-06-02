const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = "https://1drv.ms/v/c/b95b348e2594fabe/IQCCNeeAc3iCSaYArufLmpQzAcZZHJordo5Q4WYaIypiJn0?e=3xdysV";
  console.log("Navigating to:", url);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log("Page loaded. Scraping links...");
  
  // Wait a few seconds for any dynamic JS redirect or player load
  await new Promise(r => setTimeout(r, 5000));
  
  // Let's dump all video sources or download links
  const mediaSrcs = await page.evaluate(() => {
    const video = document.querySelector('video');
    const links = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href }));
    const sources = Array.from(document.querySelectorAll('source')).map(s => s.src);
    return {
      videoSrc: video ? video.src : null,
      sources,
      links
    };
  });
  
  console.log("Found Media Sources:", JSON.stringify(mediaSrcs, null, 2));
  
  // Let's take a screenshot to debug
  await page.screenshot({ path: path.join(__dirname, 'onedrive_screenshot.png') });
  console.log("Screenshot saved.");
  
  await browser.close();
})();
