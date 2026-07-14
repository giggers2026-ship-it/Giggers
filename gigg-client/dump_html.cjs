const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/otp?phone=9043140047&role=worker&mode=login', { waitUntil: 'networkidle0' });
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NO_ROOT');
  console.log('ROOT_HTML:', rootHtml);
  await browser.close();
})();
