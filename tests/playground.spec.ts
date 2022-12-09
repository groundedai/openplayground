import { test } from "@playwright/test";

// @ts-ignore
import { createPreset } from "./features.ts";

test("Suggest with and w/o API key", async ({ page }) => {
  await page.goto(`/#/playground`);
  await page.getByRole("combobox", { name: "Provider" }).selectOption("cohere");
  await page.locator("#playground-textarea").click();
  await page.locator("#playground-textarea").fill("Hello");
  await test.step("Suggest without API key", async () => {
    await page.getByRole("button", { name: "Suggest" }).click();
    await page
      .getByRole("status")
      .getByText('Cohere Error: "no api key supplied"')
      .click();
  });
  await test.step("Suggest with API key", async () => {
    await page.getByLabel("API Key").fill(process.env.COHERE_API_KEY as string);
    await page.getByLabel("Temperature").fill("0");
    await page.getByRole("button", { name: "Suggest" }).click();
  });
});

test("Can create a preset", async ({ page }) => {
  await createPreset({ page });
});
