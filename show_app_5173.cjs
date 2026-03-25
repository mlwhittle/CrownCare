const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: { width: 400, height: 850 },
        args: ['--window-size=400,900']
    });
    
    const page = await browser.newPage();
    console.log("Opening 5173 for Pastor Mel...");
    
    // Go to the TRUE App Server
    await page.goto('http://localhost:5173/');
    
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
    await page.reload();
    console.log("Browser is open on 5173.");
})();
