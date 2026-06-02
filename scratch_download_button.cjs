const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('download') || url.includes('content') || url.includes('videostream')) {
      console.log("INTERCEPTED MEDIA URL:", url);
    }
    request.continue();
  });

  const url = "https://1drv.ms/v/c/b95b348e2594fabe/IQCCNeeAc3iCSaYArufLmpQzAcZZHJordo5Q4WYaIypiJn0?e=3xdysV";
  console.log("Navigating to:", url);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Clicking download button...");
  const clicked = await page.evaluate(() => {
    // Try to find Download button
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
  
  console.log("Clicked:", clicked);
  await new Promise(r => setTimeout(r, 10000));
  
  await page.screenshot({ path: path.join(__dirname, 'onedrive_clicked.png') });
  await browser.close();
})();
