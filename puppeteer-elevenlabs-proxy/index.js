
const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`<form method="POST" action="/login" style="max-width:400px;margin:50px auto;font-family:sans-serif">
    <h2>Digitavision Login</h2>
    <input type="text" name="username" placeholder="Username" required style="width:100%;padding:10px;margin-bottom:10px"><br>
    <input type="password" name="password" placeholder="Password" required style="width:100%;padding:10px;margin-bottom:10px"><br>
    <button type="submit" style="padding:10px 20px">Login</button>
  </form>`);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://member.digitavision.com/protect/new-rewrite?f=202&url=/tools/Elevenlabs/&host=member.digitavision.com&ssl=on", {
    waitUntil: "networkidle2"
  });

  try {
    await page.type('input[name="username"]', username, { delay: 50 });
    await page.type('input[name="password"]', password, { delay: 50 });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    await page.evaluate(() => {
      document.querySelectorAll("img[src*='logo'], header, footer, .branding").forEach(el => el.remove());
    });

    const content = await page.content();
    await browser.close();
    res.send(content);
  } catch (err) {
    await browser.close();
    res.send(`<h3>Login failed or page structure changed.</h3><pre>${err}</pre>`);
  }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
