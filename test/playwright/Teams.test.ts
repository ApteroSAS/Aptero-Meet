import { test } from "../playwright-lib/baseFixtures";
import { treatConsoleErrorAsError, waitInitialSceneLoad } from "../playwright-lib/TestCommon";

test('teams mode', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('hub.html?hub_id=EVa7SjZ&vr_entry_type=2d_now&msteams=true');
  await treatConsoleErrorAsError(page);
  await waitInitialSceneLoad(page);
  await page.screenshot({ path: './coverage/store/teams.png' });
});