import { test, expect } from "@playwright/test";

// @ts-ignore
import { createRun, deleteRun } from "./features.ts";

test("Can create and remove an empty run", async ({ page }) => {
  await createRun({ page });
  // await page.getByText('No records').click();
  await deleteRun({ page });
});
