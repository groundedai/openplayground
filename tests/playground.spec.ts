import { test } from "@playwright/test";

const port = process.env.PORT;
const rootUrl = `http://localhost:${port}`;

test("Suggest with no API key shows error", async ({ page }) => {
  await page.goto(`${rootUrl}/playground`);
  await page.locator("#playground-textarea").click();
  await page.locator("#playground-textarea").fill("Hello");
  await page.getByRole("button", { name: "Suggest" }).click();
  await page
    .getByRole("status")
    .getByText('Cohere Error: "no api key supplied"')
    .click();
});
