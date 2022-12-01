import { test, expect, Page } from "@playwright/test";

// @ts-ignore
import * as features from "./features.ts";

test("End to end test @slow", async ({ page }) => {
    await features.createTemplate({ page });
    await features.saveSettings({ page });
    await features.createDataset({ page });
    await features.createRun({ page });
    await features.startRun({ page });
    await features.verifyResults({ page });
});