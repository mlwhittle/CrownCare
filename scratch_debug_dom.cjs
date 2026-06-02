const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = "https://1drv.ms/v/c/b95b348e2594fabe/IQCCNeeAc3iCSaYArufLmpQzAcZZHJordo5Q4WYaIypiJn0?e=3xdysV";
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 8000));
  
  const domInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText || b.textContent);
    const links = Array.from(document.querySelectorAll('a')).map(a => a.innerText || a.textContent);
    const spans = Array.from(document.querySelectorAll('span')).map(s => s.innerText || s.textContent).filter(t => t && t.trim().length > 0);
    return { buttons, links, spans: spans.slice(0, 100) };
  });
  
  console.log("DOM INFO:", JSON.stringify(domInfo, null, 2));
  await browser.close();
})();
