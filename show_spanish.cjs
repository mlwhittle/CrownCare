const puppeteer = require('puppeteer');

(async () => {
    // headless: false physically pops open the Chromium browser on your actual monitor!
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: { width: 400, height: 850 },
        args: ['--window-size=400,900']
    });
    
    const page = await browser.newPage();
    console.log("Opening live browser window for Pastor Mel...");
    
    // Go to the specific App Server
    await page.goto('http://localhost:5175/');
    
    // Inject the login tokens so we bypass the Welcome Screen and go straight to the Dashboard
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
    await page.reload();
    
    console.log("Browser is open and locked to the Dashboard. Look at your screen!");
    // We intentionally DO NOT close the browser here, so you can look at it.
})();
