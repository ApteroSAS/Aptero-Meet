import { test } from "./lib/baseFixtures";
import { waitInitialSceneLoad } from "./lib/TestCommon";

test('teams mode', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('hub.html?hub_id=EVa7SjZ&vr_entry_type=2d_now&msteams=true');
  await waitInitialSceneLoad(page);
  await page.screenshot({ path: './coverage/store/teams.png' });
});