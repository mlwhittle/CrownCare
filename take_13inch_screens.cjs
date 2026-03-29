const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();

    // FOR EXACTLY 2068x2800 (Apple's brand new M4 13-inch iPad Pro strict dimension constraint)
    // 1034 width x 2 scale = 2068. 1400 height x 2 scale = 2800.
    await page.setViewport({ width: 1034, height: 1400, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    console.log('Navigating to app...');
    await page.goto('https://localhost:5173/', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Sarah',
            goal: 'growth',
            texture: 'curly',
            userType: 'client',
            startDate: new Date().toISOString()
        }));
        localStorage.setItem('cc_vip', 'true');
    });

    console.log('Reloading to apply state...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000)); 

    const baseDest = 'C:/Users/mlwhi/Desktop/';

    await page.screenshot({ path: baseDest + 'm4_ipad_13_reports.png' });
    console.log('Saved 13-inch Home Dashboard');

    await page.evaluate(() => {
        const tabs = document.querySelectorAll('.mobile-tab');
        if (tabs[1]) tabs[1].click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'm4_ipad_13_diary.png' });
    console.log('Saved 13-inch Visual Diary');

    await browser.close();
    console.log('M4 13-inch iPad Screenshots complete.');
})();
