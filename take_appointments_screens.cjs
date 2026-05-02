const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();

    // Desktop view for dashboard mockups
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false });

    console.log('Navigating to app...');
    await page.goto('https://crowncare-marketing-116e4.web.app/appointments', { waitUntil: 'domcontentloaded' });

    console.log('Setting localStorage for Stylist Pro mock state...');
    await page.evaluate(() => {
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Sarah (Stylist)',
            goal: 'growth',
            texture: 'curly',
            userType: 'stylist',
            startDate: new Date().toISOString()
        }));
        localStorage.setItem('cc_vip', 'true');
        localStorage.setItem('DATA_MODE', 'mock');
    });

    console.log('Reloading...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for app to render
    await new Promise(r => setTimeout(r, 6000)); 

    const destDir = 'C:/Users/mlwhi/.gemini/antigravity/scratch/crowncare-landing-page/src/assets';

    console.log('Taking screenshot of appointments...');
    await page.screenshot({ path: destDir + '/crowncare-appointments-demo.png' });

    await browser.close();
    console.log('Screenshot complete.');
})();
