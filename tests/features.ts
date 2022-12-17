import { test, expect, Page } from "@playwright/test";

export const testPresetName = "TestPreset";
export const testDatasetName = "TestDataset";

export async function insertCohereAPIKey({ page }: { page: Page }) {
  await test.step("Insert API key", async () => {
    await page.goto(`/#/playground`);
    await page.getByRole("combobox", { name: "Provider" }).selectOption("cohere");
    await page.getByLabel("API Key").fill(process.env.COHERE_API_KEY as string);
  });
}

export async function createPreset({ page }: { page: Page }) {
  await test.step("Create preset", async () => {
    await page.goto(`/#/playground`);
    await page.locator("#playground-textarea").click();
    await page.getByRole("button", { name: "Insert Placeholder" }).click();
    await page
      .locator("#playground-textarea")
      .fill("{{text}}\n\nKeywords:\n- ");
    await page.locator('#maxTokens').fill('10');
    await page.locator('#temperature').fill('0');
    await page.getByRole("button", { name: "Save Preset" }).click();
    await page.getByLabel("Preset Name").fill(testPresetName);
    await page.getByRole("button", { name: "Save" }).last().click();
  });
}

export async function createDataset({ page }: { page: Page }) {
  await test.step("Create a dataset", async () => {
    await page.goto(`/#/datasets`);
    await page.getByRole("button", { name: "Create Dataset" }).click();
    await page.getByLabel("Dataset name").click();
    await page.getByLabel("Dataset name").fill(testDatasetName);
    //await page.getByLabel('Data file').click();
    await page
      .getByLabel("Data file")
      .setInputFiles("data/articles_3_2022-11-10.md");
    await page.locator("#form").getByRole("button", { name: "Create" }).click();
    await page.getByRole("cell", { name: testDatasetName }).click();
    const datasetRow = page
      .getByRole("cell", { name: testDatasetName })
      .locator("..");
    await datasetRow.locator("button[data-action='view']").click();
    expect(await page.locator("#row-count-value").textContent()).toBe("3");
  });
}

export async function createCSVDataset({ page }: { page: Page }) {
  await test.step("Create a csv based dataset", async () => {
    await page.goto(`/#/datasets`);
    await page.getByRole("button", { name: "Create Dataset" }).click();
    await page.getByLabel("Dataset name").click();
    await page.getByLabel("Dataset name").fill(testDatasetName);
    //await page.getByLabel('Data file').click();
    await page
      .getByLabel("Data file")
      .setInputFiles("data/organs_wikilist.csv");
    await page.getByText("Column").nth(1).click();
    await page.getByRole("textbox", { name: "Column" }).fill("Organ");
    await page.locator("#form").getByRole("button", { name: "Create" }).click();
    await page.getByRole("cell", { name: testDatasetName }).click();
    const datasetRow = page
      .getByRole("cell", { name: testDatasetName })
      .locator("..");
    await datasetRow.locator("button[data-action='view']").click();
    await page.getByText("Rows: 77").click();
    await page.getByRole("cell", { name: "Adrenal glands" }).click();
    //expect(await page.locator('#row-count-value').textContent()).toBe('3');
  });
}

export async function deleteDataset({ page }: { page: Page }) {
  await test.step("Delete a dataset", async () => {
    await page.goto(`/#/datasets`);
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    const datasetRow = page
      .getByRole("cell", { name: testDatasetName })
      .locator("..");
    await datasetRow.locator("button[data-action='delete']").click();
    await expect(datasetRow).toBeHidden();
  });
}

export async function createRun({ page, presetName, datasetName }: { page: Page, presetName?: string, datasetName?: string }) {
  await test.step("Create a run", async () => {
    await page.goto(`/#/runs`);
    await page.getByRole("link", { name: " Runs" }).click();
    await page.getByRole("button", { name: "Create Run" }).click();
    if (presetName) {
      await page.getByRole("combobox", { name: "Preset" }).selectOption({label: presetName});
    }
    if (datasetName) {
      await page.getByRole("combobox", { name: "Dataset" }).selectOption({label: datasetName});
    }
    await page.getByText("Format results").click();
    await page.locator("#form").getByRole("button", { name: "Create" }).click();
  });

  await test.step("Verify run created", async () => {
    const runRow = page.getByRole("cell", { name: "Run 2" }).locator("..");
    await runRow.locator("button[data-action='view']").click();
    await page.getByRole("heading", { name: "Run 2" }).click();
  });
}

export async function deleteRun({ page }: { page: Page }) {
  await test.step("Delete run", async () => {
    await page.goto(`/#/runs`);
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    const runRow = page.getByRole("cell", { name: "Run 2" }).locator("..");
    await runRow.locator("button[data-action='delete']").click();
  });
}

export async function startRun({ page }: { page: Page }) {
  await test.step("Start run", async () => {
    await page.getByRole("button", { name: "Start" }).click();
    //await page.getByRole('status').click();
    await page.getByText("Completed").click();
  });
}

export async function verifyResults({ page }: { page: Page }) {
  await test.step("Verify results", async () => {
    await page.getByText('Keywords:- Intermittent fasting- Obesity-').click();
    await page.getByText('Keywords:- Intermittent fasting- Long-term memory').click();
  });
}
