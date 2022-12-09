import { test, expect } from "@playwright/test";

// @ts-ignore
import { createDataset, deleteDataset, createCSVDataset } from "./features.ts";

test("Can upload and view and delete a dataset", async ({ page }) => {
    await createDataset({ page });
    await deleteDataset({ page });
});

test("Can create csv dataset", async ({ page }) => {
    await createCSVDataset({ page });
});