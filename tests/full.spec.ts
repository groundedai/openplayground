import { test, expect, Page } from "@playwright/test";

// @ts-ignore
import * as features from "./features.ts";

test("End to end test @slow", async ({ page }) => {
  await features.insertCohereAPIKey({ page });
  await features.createPreset({ page });
  await features.createDataset({ page });
  await features.createRun({ page, presetName: features.testPresetName, datasetName: features.testDatasetName });
  await features.startRun({ page });
  await features.verifyResults({ page });
});
