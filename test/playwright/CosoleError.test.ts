import { expect, test } from "./lib/baseFixtures";
import {
  treatConsoleErrorAsError, treatConsoleWarnAndErrorAsError,
  treatConsoleWarnAsError,
  waitInitialSceneLoad,
  waitPageLoadedAll
} from "./lib/TestCommon";

test('console error', async ({ page }) => {
  await page.goto('index.html')
  await treatConsoleErrorAsError(page);
  try {
    await page.evaluate(async () => {
      console.error("trigger error");
    });
    expect(false).toBeTruthy();//fails the test if we get here
  }catch (e) {
    /* expected*/
    expect(e.message).toContain("playwright console error reporter");
  }

});

test('warn error', async ({ page }) => {
  await page.goto('index.html')
  await treatConsoleWarnAsError(page);
  try {
    await page.evaluate(async () => {
      console.warn("trigger error");
    });
    expect(false).toBeTruthy();//fails the test if we get here
  }catch (e) {
    /* expected*/
    expect(e.message).toContain("playwright console warn reporter");
  }

});

test('warn and error', async ({ page }) => {
  await page.goto('index.html')
  await treatConsoleWarnAndErrorAsError(page)
  try {
    await page.evaluate(async () => {
      console.warn("trigger error");
    });
    expect(false).toBeTruthy();//fails the test if we get here
  }catch (e) {
    /* expected*/
    expect(e.message).toContain("playwright console warn reporter");
  }
  try {
    await page.evaluate(async () => {
      console.error("trigger error");
    });
    expect(false).toBeTruthy();//fails the test if we get here
  }catch (e) {
    /* expected*/
    expect(e.message).toContain("playwright console error reporter");
  }

});