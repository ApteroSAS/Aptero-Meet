//https://alphahub.aptero.co/bxmhkMb/playwright-network

import { test } from "./lib/baseFixtures";
import { runMultiplayer } from "./lib/MultiPlayerLib";

test('Multi Player 5', async ({ page }) => {
  await runMultiplayer(5,page,'hub.html?hub_id=bxmhkMb&vr_entry_type=2d_now');
});