//https://alphahub.aptero.co/bxmhkMb/playwright-network

import { test } from "./lib/baseFixtures";
import { waitInitialSceneLoad, waitPageLoadedAll } from "./lib/TestCommon";

export async function runMultiplayer(playersNumber,page){
  test.setTimeout((playersNumber*60*1000)+4*60*1000);
  const context = page.context();

  await page.goto('hub.html?hub_id=bxmhkMb&vr_entry_type=2d_now')
  await page.context().grantPermissions(['camera', 'microphone']);
  await waitInitialSceneLoad(page);

  // Click text=MoreMore
  await page.locator('text=MoreMore').click();
  // Click text=SettingsPreferences
  await page.locator('text=SettingsPreferences').click();
  // Click text=Misc
  await page.locator('text=Misc').click();
  await (await (await (await page.locator('text=Disable auto-exit when multiple hubs instances are open')).locator('xpath=..')).locator("input")).click();
  await (await (await (await page.locator('text=Disable auto-exit when idle or backgrounded')).locator('xpath=..')).locator("input")).click();
  //await page.locator('div:nth-child(10) .preferences-screen__row__24y1Q input').click();
  //await page.locator('div:nth-child(11) .preferences-screen__row__24y1Q input').check();
  // Click [aria-label="Close Preferences Menu"]
  await page.locator('[aria-label="Close Preferences Menu"]').click();

  //Start network test
  for (let i = 0; i < playersNumber-1; i++) {
    await context.newPage();
  }
  const allPages = context.pages();
  for (const page of allPages) {
    //https://alphahub.aptero.co/bxmhkMb/playwright-network
    await page.goto('hub.html?hub_id=bxmhkMb&vr_entry_type=2d_now')
    await waitPageLoadedAll(page);
  }
  await new Promise(resolve => setTimeout(resolve,2000));
}

test('Multi Player 5', async ({ page }) => {
  await runMultiplayer(5,page);
});