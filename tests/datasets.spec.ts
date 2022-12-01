import { test, expect } from "@playwright/test";

// @ts-ignore
import { createDataset, deleteDataset } from "./features.ts";

test("Can upload and view and delete a dataset", async ({ page }) => {
    await createDataset({ page });
    await deleteDataset({ page });
});