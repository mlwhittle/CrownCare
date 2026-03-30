const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();

    // Set viewport to exactly 1284x2778 (428x926 @ 3x) for Apple 6.5-inch Display requirement
    await page.setViewport({ width: 428, height: 926, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

    console.log('Navigating to app...');
    await page.goto('https://localhost:5175/', { waitUntil: 'domcontentloaded' });

    // Inject onboarding state into localStorage so we bypass the quiz
    await page.evaluate(() => {
        localStorage.setItem('cc_onboarding', JSON.stringify({
            name: 'Sarah',
            goal: 'growth',
            texture: 'curly',
            userType: 'client',
            startDate: new Date().toISOString()
        }));
        localStorage.setItem('cc_vip', 'true'); // Bypass the paywall
    });

    console.log('Reloading to apply state...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 6000)); // give it time to load fonts & UI

    const baseDest = 'C:/Users/mlwhi/Desktop/';

    // Screenshot 1: Home Dashboard
    await page.screenshot({ path: baseDest + 'app_ui_reports.png' });
    console.log('Saved Home Dashboard');
    
    const html = await page.content();
    require('fs').writeFileSync('DOM_DUMP.html', html);
    console.log('DOM DUMP SAVED.');

    // Navigate to Diary (Index 1 of .mobile-tab)
    console.log('Clicking Diary...');
    const tabsExist = await page.evaluate(() => document.querySelectorAll('.mobile-tab').length);
    console.log('Found mobile-tabs:', tabsExist);

    await page.evaluate(() => document.querySelectorAll('.mobile-tab')[1].click());
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'app_ui_diary.png' });
    console.log('Saved Visual Diary');

    // Navigate to Nutrition via Menu
    console.log('Clicking Menu -> Nutrition...');
    // Evaluating a direct querySelector to be immune to array index changes:
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.mobile-tab'));
        const menuTab = tabs.find(t => t.textContent.includes('Menu'));
        if (menuTab) menuTab.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.card'));
        const nutritionCard = cards.find(c => c.textContent.includes('Nutrition'));
        if (nutritionCard) nutritionCard.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'app_ui_nutrition.png' });
    console.log('Saved Nutrition Planner');

    // Open AI Coach Modal
    console.log('Clicking AI Coach...');
    await page.evaluate(() => document.querySelector('.nav-ai-button').click());
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'app_ui_ai_coach.png' });
    console.log('Saved AI Coach');

    await browser.close();
    console.log('Screenshots complete.');
})();
