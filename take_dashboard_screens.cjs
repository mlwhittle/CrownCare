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
    await page.goto('https://crowncare-marketing-116e4.web.app/', { waitUntil: 'domcontentloaded' });

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
        // Force the app context data mode to mock just in case
        localStorage.setItem('DATA_MODE', 'mock');
    });

    console.log('Reloading...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Wait for app to render and mock data to populate
    await new Promise(r => setTimeout(r, 5000)); 

    // Try to click the Stylist Portal tab
    console.log('Clicking Stylist Portal tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.mobile-tab, button'));
        const portalTab = tabs.find(t => t.textContent && (t.textContent.includes('Pro') || t.textContent.includes('Portal') || t.textContent.includes('Stylist')));
        if (portalTab) portalTab.click();
    });

    await new Promise(r => setTimeout(r, 2000)); 
    
    // Create assets directory if it doesn't exist
    const destDir = 'C:/Users/mlwhi/.gemini/antigravity/scratch/crowncare-landing-page/src/assets';
    if (!fs.existsSync(destDir)){
        fs.mkdirSync(destDir, { recursive: true });
    }

    console.log('Taking first screenshot (Dashboard Hub)...');
    await page.screenshot({ path: destDir + '/crowncare-pro-dashboard-demo.png' });

    // Try to click a client profile if available in the roster
    console.log('Clicking Client Profile...');
    await page.evaluate(() => {
        // Look for anything resembling a client card or 'View Profile' button
        const buttons = Array.from(document.querySelectorAll('button, div'));
        const profileBtn = buttons.find(b => b.textContent && b.textContent.includes('View Profile'));
        if (profileBtn) {
            profileBtn.click();
        } else {
            // Alternatively try to click the first client in the list
            const clientCard = document.querySelector('.bg-gray-900.rounded-xl.p-4');
            if (clientCard) clientCard.click();
        }
    });

    await new Promise(r => setTimeout(r, 2000)); 

    console.log('Taking second screenshot (Client Profile)...');
    await page.screenshot({ path: destDir + '/crowncare-client-profile-demo.png' });

    await browser.close();
    console.log('Screenshots complete.');
})();
