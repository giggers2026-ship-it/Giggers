const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('BROWSER_REQUEST_FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5173/otp?phone=9043140047&role=worker&mode=login', { waitUntil: 'networkidle2' });
    console.log('Page loaded');
  } catch (e) {
    console.error('Failed to load page', e);
  }

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
