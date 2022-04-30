//https://alphahub.aptero.co/bxmhkMb/playwright-network

import { test } from "../playwright/lib/baseFixtures";
import { runMultiplayer } from "../playwright/MultiPlayer.test";

test('Multi Player', async ({ page }) => {
  await runMultiplayer(50,page);
});