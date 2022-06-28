import { test } from "./lib/baseFixtures";
import { treatConsoleErrorAsError, waitInitialSceneLoad } from "./lib/TestCommon";

test('Custom-Link', async ({ page }) => {
  test.setTimeout(120000);
  //https://alphahub.aptero.co/y3UKjjo/playwright-test-2
  await page.goto("hub.html?hub_id=Z9SCZcH&vr_entry_type=2d_now&cqs={user:1234}");
  await treatConsoleErrorAsError(page);
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);
});