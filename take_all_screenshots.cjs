const puppeteer = require('puppeteer');

const devices = [
    { name: 'iphone_6.5', logicalWidth: 414, logicalHeight: 896, scale: 3 }, // 1242 x 2688
    { name: 'iphone_6.7', logicalWidth: 428, logicalHeight: 926, scale: 3 }, // 1284 x 2778
    { name: 'ipad_12.9', logicalWidth: 1024, logicalHeight: 1366, scale: 2 }, // 2048 x 2732
];

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: 'new', args: ['--ignore-certificate-errors', '--force-device-scale-factor'] });

        for (const device of devices) {
            console.log(`\n--- Taking screenshots for ${device.name} ---`);
            const page = await browser.newPage();
            
            // Mock iOS platform and required state
            await page.evaluateOnNewDocument(() => {
                window.Capacitor = {
                    isNativePlatform: () => true,
                    getPlatform: () => 'ios'
                };
                localStorage.setItem('cc_onboarding', JSON.stringify({ 
                    name: "Ashley", 
                    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    userType: "solo", 
                    hairType: "4C", 
                    concern: "Moisture Retention" 
                }));
            });

            await page.setViewport({ 
                width: device.logicalWidth, 
                height: device.logicalHeight, 
                deviceScaleFactor: device.scale 
            });

            const outDir = `C:\\Users\\mlwhi\\.gemini\\antigravity\\brain\\b0e3e804-498d-4e31-b8da-b4eb6481486d`;

            console.log(`[${device.name}] Capturing Home...`);
            await page.goto('https://localhost:5173/?view=home', { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 4000));
            await page.screenshot({ path: `${outDir}\\${device.name}_home.png` });

            console.log(`[${device.name}] Capturing Paywall...`);
            await page.goto('https://localhost:5173/?view=paywall', { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 4000));
            await page.screenshot({ path: `${outDir}\\${device.name}_paywall.png` });

            console.log(`[${device.name}] Capturing Settings/About...`);
            await page.goto('https://localhost:5173/?view=settings', { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 4000));
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await new Promise(r => setTimeout(r, 1000));
            await page.screenshot({ path: `${outDir}\\${device.name}_settings.png` });

            await page.close();
        }

        await browser.close();
        console.log("\nALL SCREENSHOTS COMPLETED SUCCESSFULLY.");
    } catch(e) {
        console.error("Screenshot error:", e);
    }
    
    process.exit(0);
})();
