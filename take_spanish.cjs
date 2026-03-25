const puppeteer = require('puppeteer');

(async () => {
    console.log('Waiting 5 seconds for Vite HMR to safely recompile...');
    await new Promise(r => setTimeout(r, 5000));
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

    await page.goto('http://localhost:5175/', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
        localStorage.setItem('i18nextLng', 'en'); // Load English (which we swapped to Spanish words)
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Sarah',
            goal: 'growth',
            texture: 'curly',
            userType: 'client',
            startDate: new Date().toISOString()
        }));
        localStorage.setItem('cc_vip', 'true'); 
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000)); 

    const dest = 'C:/Users/mlwhi/.gemini/antigravity/brain/15d34a12-734a-4a7a-b03f-bf1b49956fb3/spanish_dashboard_ui.png';
    await page.screenshot({ path: dest });
    console.log('Saved Spanish Dashboard to ' + dest);
    
    await browser.close();
})();
