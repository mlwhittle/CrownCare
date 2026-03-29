const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        ignoreHTTPSErrors: true,
        args: ['--ignore-certificate-errors', '--disable-web-security'] 
    });
    const page = await browser.newPage();

    // Set viewport to exactly 2048x2732 (1024x1366 @ 2x) for Apple 13-inch iPad Display requirement
    await page.setViewport({ width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

    console.log('Navigating to app...');
    await page.goto('https://localhost:5173/', { waitUntil: 'domcontentloaded' });

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
    await page.screenshot({ path: baseDest + 'ipad_ui_reports.png' });
    console.log('Saved Home Dashboard');

    // Navigate to Diary (Index 1 of .mobile-tab)
    console.log('Clicking Diary...');
    await page.evaluate(() => {
        const tabs = document.querySelectorAll('.mobile-tab');
        if (tabs[1]) tabs[1].click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'ipad_ui_diary.png' });
    console.log('Saved Visual Diary');

    // Navigate to Nutrition via Menu
    console.log('Clicking Menu -> Nutrition...');
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
    await page.screenshot({ path: baseDest + 'ipad_ui_nutrition.png' });
    console.log('Saved Nutrition Planner');

    // Open AI Coach Modal
    console.log('Clicking AI Coach...');
    await page.evaluate(() => {
        const aiBtn = document.querySelector('.nav-ai-button');
        if (aiBtn) aiBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: baseDest + 'ipad_ui_ai_coach.png' });
    console.log('Saved AI Coach');

    await browser.close();
    console.log('iPad Screenshots complete.');
})();
