const puppeteer = require('puppeteer');
const fs = require('fs');
const { spawn } = require('child_process');

(async () => {
    // Wait for the background Vite server to fully spin up
    console.log("Waiting for Vite dev server on port 5173...");
    await new Promise(r => setTimeout(r, 6000));

    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: 'new', args: ['--ignore-certificate-errors'] });
        const page = await browser.newPage();
        
        // Mock iOS platform
        await page.evaluateOnNewDocument(() => {
            window.Capacitor = {
                isNativePlatform: () => true,
                getPlatform: () => 'ios'
            };
        });

        // iPhone 14 Pro Max App Store specs: 1290x2796 pixels
        // Logical width is 430x932, scale 3
        await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 3 });

        console.log("Taking Paywall screenshot...");
        await page.goto('https://localhost:5173/?view=paywall', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 4000)); // wait for fonts and animations
        await page.screenshot({ path: 'screenshot_paywall_ios.png' });
        await new Promise(r => setTimeout(r, 2000)); // wait for animations
        await page.screenshot({ path: 'screenshot_paywall_ios.png' });

        console.log("Taking Settings/About screenshot...");
        await page.goto('https://localhost:5173/?view=settings', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 4000)); // wait for fonts and animations
        await new Promise(r => setTimeout(r, 2000)); // wait for animations
        
        // Scroll down to the "About" section in Settings so Developer Support is visible
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(r => setTimeout(r, 1000));

        await page.screenshot({ path: 'screenshot_settings_ios.png' });

        await browser.close();
        console.log("Screenshots saved to root folder.");

        // Kill vite server (hacky windows way, normally you'd handle pid nicely)
        // Since we don't strictly need to kill it if it stays running for next dev, it's fine.
    } catch(e) {
        console.error("Screenshot error:", e);
    }
    
    process.exit(0);
})();
