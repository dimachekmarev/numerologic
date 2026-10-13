import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
fs.mkdirSync("../docs/screenshots", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.E2E_BROWSER_PATH,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Europe/Moscow",
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.E2E_URL || "http://127.0.0.1:8080";
await page.goto(base + "/");
await page.getByRole("heading", { name: /Меньше шума/ }).waitFor();
await page.screenshot({
  path: "../docs/screenshots/home-desktop.png",
  fullPage: true,
});
await page.getByRole("link", { name: /Найти свой первый шаг/ }).click();
await page.getByPlaceholder("Например, Дмитрий").fill("Анна");
await page.getByRole("button", { name: "Дальше" }).click();
await page.locator("input[type=date]").fill("1995-05-02");
await page.getByRole("button", { name: "Дальше" }).click();
await page.getByRole("button", { name: "Дальше" }).click();
await page.getByRole("button", { name: "Дальше" }).click();
await page.locator("textarea").fill("Хочу научиться спокойнее отказывать");
await page.getByRole("button", { name: "Показать результат" }).click();
await page.waitForURL("**/result");
await page.goto(base + "/account");
await page.locator("input[type=email]").fill(`e2e-${Date.now()}@example.com`);
await page.locator("input[type=password]").fill("correct-horse-battery");
await page.getByRole("button", { name: "Создать аккаунт" }).click();
await page.getByRole("button", { name: "Скачать мои данные" }).waitFor();
await page.goto(base + "/journal");
await page
  .locator("textarea")
  .fill("Сегодня получилось сделать небольшой шаг.");
await page.getByRole("button", { name: "Сохранить запись" }).click();
await page.getByText("Запись сохранена", { exact: true }).waitFor();
await page.goto(base + "/goals");
await page
  .getByPlaceholder("Написать черновик, договориться о встрече…")
  .fill("Написать один абзац");
await page.getByRole("button", { name: "Добавить" }).click();
await page.getByText("Написать один абзац", { exact: false }).waitFor();
await page.goto(base + "/practices/boundaries");
await page
  .getByRole("heading", { name: "Карта границ", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Начать 7 дней бесплатно" }).click();
await page.getByRole("heading", { name: "Закрепляем", exact: true }).waitFor();
await page.locator("input[type=checkbox]").first().check();
await page.goto(base + "/products/deep-reading");
await page.getByRole("button", { name: "Открыть материал и PDF" }).click();
await page.waitForURL("**/report/*");
await page.getByRole("link", { name: "Скачать PDF ↓" }).waitFor();
await page.goto(base + "/numbers");
await page.getByRole("link", { name: "Скачать карту PDF ↓" }).waitFor();
await page.goto(base + "/today");
await page.getByRole("heading", { name: "Сегодня — для вас." }).waitFor();
await page.screenshot({
  path: "../docs/screenshots/today-desktop.png",
  fullPage: true,
});
const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
for (const route of [
  "/",
  "/today",
  "/numbers",
  "/weekly",
  "/journal",
  "/calendar",
  "/practices",
  "/practices/boundaries",
  "/goals",
  "/dashboard",
  "/club",
  "/checkout?product=club",
  "/account",
  "/assistant",
]) {
  await mobile.goto(base + route);
  await mobile.locator("h1").waitFor();
  await mobile.waitForTimeout(200);
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(overflow, false, `Horizontal overflow on ${route}`);
}
await mobile.goto(base + "/today");
await mobile.getByRole("heading", { name: "Сегодня — для вас." }).waitFor();
await mobile.screenshot({
  path: "../docs/screenshots/today-mobile.png",
  fullPage: true,
});
assert.deepEqual(errors, []);
fs.writeFileSync(
  "../docs/e2e-result.json",
  JSON.stringify(
    { full_flow: "passed", mobile_routes: 14, browser_errors: errors },
    null,
    2,
  ),
);
console.log(
  "PASS: quiz → account → journal → goal → trial → report → unlocked practice; 14 mobile routes, no overflow or browser exceptions",
);
await browser.close();
