import { test, expect, Page } from "@playwright/test";

export async function createTemplate({ page }: { page: Page }) {
    await test.step("Create template", async () => {
        await page.goto(`/#/playground`);
        await page.locator('#playground-textarea').click();
        await page.getByRole('button', { name: 'Insert Placeholder' }).click();
        await page.locator('#playground-textarea').fill('{{text}}\n\nKeywords:\n- ');
        await page.getByRole('button', { name: 'Save Template' }).click();
        await page.getByRole('heading', { name: 'Name for template:' }).click();
        await page.locator('#input').fill('TestTemplate');
        await page.getByRole('button', { name: 'Confirm' }).click();
    });
}

export async function saveSettings({ page }: { page: Page }) {
    await test.step("Save cohere settings", async () => {
        await page.goto(`/#/playground`);
        await page.getByRole('combobox', { name: 'Provider' }).selectOption('cohere');
        await page.getByLabel('API Key').fill(process.env.COHERE_API_KEY as string);
        await page.getByLabel('Temperature').fill('0');
        await page.getByLabel('Max Tokens').fill('10');
        await page.getByLabel('Stop sequences').fill('\\n\\n');
        await page.locator('#save-settings-button').click();
        await page.locator('#input').last().fill('TestSettings');  //TODO: Fix this once promptUserInput is refactored
        await page.getByRole('button', { name: 'Confirm' }).click();
    });
    await test.step('Verify saved settings', async () => {
        await page.goto(`/#/playground`);
        await page.locator('#load-settings-button').click();
        await page.getByRole('cell', { name: 'TestSettings' }).click();
        await page.getByRole('button', { name: '×' }).click();
    });
}

export async function createDataset({ page }: { page: Page }) {
    await test.step("Create a dataset", async () => {
        await page.goto(`/#/datasets`);
        await page.getByRole('button', { name: 'Create Dataset' }).click();
        await page.getByText('× New Dataset Dataset name Data file Separator Create').click();
        await page.getByLabel('Dataset name').click();
        await page.getByLabel('Dataset name').fill('TestDataset');
        //await page.getByLabel('Data file').click();
        await page.getByLabel('Data file').setInputFiles('data/articles_3_2022-11-10.md');
        await page.locator('#form').getByRole('button', { name: 'Create' }).click();
        await page.getByRole('cell', { name: 'TestDataset' }).click();
        await page.getByRole('button', { name: 'View' }).click();
        //expect(await page.locator('#row-count-value').textContent()).toBe('3');
    });
}

export async function deleteDataset({ page }: { page: Page }) {
    await test.step("Delete a dataset", async () => {
        await page.goto(`/#/datasets`);
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.accept().catch(() => { });
        });
        await page.getByRole('button', { name: 'Delete' }).click();
        await page.getByText('You don\'t have any datasets yet. Create one').click();
    });
}

export async function createRun({ page }: { page: Page }) {
    await test.step("Create a run", async () => {
        await page.goto(`/#/runs`);
        await page.getByRole('link', { name: ' Runs' }).click();
        await page.getByRole('button', { name: 'Create Run' }).click();
        await page.getByText('Format results').click();
        await page.locator('#form div').filter({ hasText: 'Create' }).click();
        await page.locator('#form').getByRole('button', { name: 'Create' }).click();
    });

    await test.step("Verify run created", async () => {
        await page.getByRole('button', { name: 'View' }).click();
        await page.getByRole('heading', { name: 'Run 1' }).click();
    });
}

export async function deleteRun({ page }: { page: Page }) {
    await test.step("Delete run", async () => {
        await page.goto(`/#/runs`);
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.accept().catch(() => { });
        });
        await page.getByRole('button', { name: 'Delete' }).click();
        await page.getByText('No runs').click();
    });
}

export async function startRun({ page }: { page: Page }) {
    await test.step("Start run", async () => {
        await page.getByRole('button', { name: 'Start' }).click();
        //await page.getByRole('status').click();
        await page.getByText('Completed').click();
    });
}

export async function verifyResults({ page }: { page: Page }) {
    await test.step("Verify results", async () => {
        await page.locator('#run-view').getByText('Format results').click();
        await page.getByLabel('Inject start text').fill("\\n\\nKeywords:\\n-");
        await page.getByText('Keywords:-undefined Intermittent fasting- Obesity-').click();  //TODO: Fixed `undefined` in the output 
        await page.getByText('Keywords:-undefined Intermittent fasting- Long-term memory').click();
    });
}