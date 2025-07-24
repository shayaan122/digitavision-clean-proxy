const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const targetUrl = 'https://member.digitavision.com/protect/new-rewrite?f=202&url=/tools/Elevenlabs/&host=member.digitavision.com&ssl=on';

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Remove unwanted elements
    await page.evaluate(() => {
      const logo = document.querySelector('img[alt="Digitavision"]');
      if (logo) logo.remove();

      const footer = document.querySelector('footer') || document.querySelector('.footer') || document.querySelector('#footer');
      if (footer) footer.remove();

      const chatWidget = document.querySelector('iframe[src*="tawk.to"]') || document.querySelector('.chat-widget') || document.querySelector('.tawk-button');
      if (chatWidget) chatWidget.remove();
    });

    const content = await page.content();
    res.send(content);
  } catch (err) {
    console.error("Error rendering page:", err);
    res.status(500).send("Something went wrong.");
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});