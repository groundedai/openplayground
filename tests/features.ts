import { test, expect, Page } from "@playwright/test";

export async function createPreset({ page }: { page: Page }) {
  await test.step("Create preset", async () => {
    await page.goto(`/#/playground`);
    await page.locator("#playground-textarea").click();
    await page.getByRole("button", { name: "Insert Placeholder" }).click();
    await page
      .locator("#playground-textarea")
      .fill("{{text}}\n\nKeywords:\n- ");
    await page.getByRole("button", { name: "Save Preset" }).click();
    await page.getByLabel("Preset Name").fill("TestPreset");
    await page.getByRole("button", { name: "Save" }).last().click();
  });
}

export async function createDataset({ page }: { page: Page }) {
  await test.step("Create a dataset", async () => {
    await page.goto(`/#/datasets`);
    await page.getByRole("button", { name: "Create Dataset" }).click();
    await page.getByLabel("Dataset name").click();
    await page.getByLabel("Dataset name").fill("TestDataset");
    //await page.getByLabel('Data file').click();
    await page
      .getByLabel("Data file")
      .setInputFiles("data/articles_3_2022-11-10.md");
    await page.locator("#form").getByRole("button", { name: "Create" }).click();
    await page.getByRole("cell", { name: "TestDataset" }).click();
    const datasetRow = page
      .getByRole("cell", { name: "TestDataset" })
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
    await page.getByLabel("Dataset name").fill("TestDataset");
    //await page.getByLabel('Data file').click();
    await page
      .getByLabel("Data file")
      .setInputFiles("data/organs_wikilist.csv");
    await page.getByText("Column").nth(1).click();
    await page.getByRole("textbox", { name: "Column" }).fill("Organ");
    await page.locator("#form").getByRole("button", { name: "Create" }).click();
    await page.getByRole("cell", { name: "TestDataset" }).click();
    const datasetRow = page
      .getByRole("cell", { name: "TestDataset" })
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
      .getByRole("cell", { name: "TestDataset" })
      .locator("..");
    await datasetRow.locator("button[data-action='delete']").click();
    await expect(datasetRow).toBeHidden();
  });
}

export async function createRun({ page }: { page: Page }) {
  await test.step("Create a run", async () => {
    await page.goto(`/#/runs`);
    await page.getByRole("link", { name: " Runs" }).click();
    await page.getByRole("button", { name: "Create Run" }).click();
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
    await page.locator("#run-view").getByText("Format results").click();
    await page.getByLabel("Inject start text").fill("\\n\\nKeywords:\\n-");
    await page
      .getByText("Keywords:-undefined Intermittent fasting- Obesity-")
      .click(); //TODO: Fixed `undefined` in the output
    await page
      .getByText("Keywords:-undefined Intermittent fasting- Long-term memory")
      .click();
  });
}
