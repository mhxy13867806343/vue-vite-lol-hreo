import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  const page = await browser.newPage();

  try {
    // 英雄列表页面
    console.log('正在截取英雄列表页面...');
    await page.goto('http://localhost:5173/');
    await page.waitForSelector('.heroes-grid', { timeout: 5000 });
    await page.screenshot({
      path: path.join(__dirname, '../project-screenshots/heroes-list.png'),
      fullPage: true
    });

    // 英雄详情页面
    console.log('正在截取英雄详情页面...');
    await page.waitForSelector('.hero-card', { timeout: 5000 });
    await page.click('.hero-card');
    await page.waitForSelector('.hero-detail', { timeout: 5000 });
    await page.screenshot({
      path: path.join(__dirname, '../project-screenshots/hero-detail.png'),
      fullPage: true
    });

    // 皮肤展示
    console.log('正在截取皮肤展示页面...');
    await page.waitForSelector('.el-tabs__item', { timeout: 5000 });
    const tabs = await page.$$('.el-tabs__item');
    for (const tab of tabs) {
      const text = await tab.evaluate(el => el.textContent);
      if (text.includes('英雄皮肤')) {
        await tab.click();
        break;
      }
    }
    await page.waitForSelector('.hero-skins', { timeout: 5000 });
    await page.screenshot({
      path: path.join(__dirname, '../project-screenshots/hero-skins.png'),
      fullPage: true
    });

    console.log('截图完成！');
  } catch (error) {
    console.error('截图过程中出现错误：', error);
  } finally {
    await browser.close();
  }
})();
