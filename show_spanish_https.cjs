const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: { width: 400, height: 850 },
        ignoreHTTPSErrors: true,
        args: ['--window-size=400,900', '--ignore-certificate-errors']
    });
    
    const page = await browser.newPage();
    console.log("Opening Secure HTTPS 5173 for Pastor Mel...");
    
    // Using HTTPS
    await page.goto('https://localhost:5173/', { waitUntil: 'domcontentloaded' });
    
    // Inject the login tokens
    await page.evaluate(() => {
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Pastor Mel',
            goal: 'growth',
            texture: 'curly',
            userType: 'client',
            startDate: new Date().toISOString()
        }));
        localStorage.setItem('cc_vip', 'true');
    });
    
    // Reload so the Dashboard appears
    await page.reload({ waitUntil: 'domcontentloaded' });
    console.log("Browser is open on HTTPS 5173.");
})();
