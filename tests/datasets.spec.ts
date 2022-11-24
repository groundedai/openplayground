import { test } from "@playwright/test";

const port = process.env.PORT;
const rootUrl = `http://localhost:${port}`;

test("Can upload dataset", async ({ page }) => {
  await page.goto(`${rootUrl}/datasets`);
  await page.getByLabel("New dataset name").click();
  await page.getByLabel("New dataset name").fill("test-dataset");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("cell", { name: "test-dataset" }).click();
  await page.getByRole("button", { name: "View" }).click();
  await page.getByRole("heading", { name: "test-dataset" }).click();
  await page.getByLabel("Data file").click();
  await page
    .getByLabel("Data file")
    .setInputFiles("data/articles_10_2022-11-10.md");
  await page.getByRole("button", { name: "Upload" }).click();
  await page.getByRole("cell", { name: "Text" }).click();
});
