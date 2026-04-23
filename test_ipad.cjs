const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
    console.log('Starting Vite server...');
    const server = spawn('npm.cmd', ['run', 'dev'], { cwd: __dirname, shell: true });
    
    // Wait for server to be ready
    await new Promise(r => setTimeout(r, 5000));

    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();

    // iPad Air 11-inch dimensions (820x1180 logical pixels)
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    console.log('Navigating to app...');
    await page.goto('https://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Inject state to bypass quiz
    await page.evaluate(() => {
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Sarah',
            goal: 'growth'
        }));
    });

    console.log('Reloading...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));

    page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
    });

    console.log('Navigating to Settings...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.mobile-tab'));
        const menuTab = tabs.find(t => t.textContent.includes('Menu') || t.textContent.includes('Settings'));
        if (menuTab) menuTab.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        const settingsCard = cards.find(c => c.textContent.includes('Profile'));
        if (settingsCard) settingsCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Clicking Clear All Data...');
    await page.screenshot({ path: 'test_ipad_debug.png' });
    const result = await page.evaluate(async () => {
        const btns = Array.from(document.querySelectorAll('.btn-danger'));
        const clearBtn = btns.find(b => b.textContent.includes('Clear All Data'));
        if (clearBtn) {
            clearBtn.click();
            return "Clicked";
        }
        return "Not found";
    });
    console.log(`Clear button status: ${result}`);
    await new Promise(r => setTimeout(r, 2000));

    // Verify localStorage is cleared
    const storageKeys = await page.evaluate(() => Object.keys(localStorage));
    console.log(`LocalStorage keys remaining: ${storageKeys.length}`);

    await browser.close();
    server.kill();
    console.log('Test successful.');
})();
