//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import { treatConsoleErrorAsError, waitInitialSceneLoad, waitPageLoadedAll } from "../playwright-lib/TestCommon";
import {
    stopErrorWatchTeams,
    initialConnexion,
    notifyErrorInFrame, startErrorWatchTeams,
    treatConsoleErrorAsErrorInFrame,
    waitInitialSceneLoadIframe
} from "../playwright-lib/TeamsTest";

async function navigateToTab(page,tabName = "Virtual Meeting"){
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/conversations/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
    // Click [aria-label="Virtual Meeting Press Enter to select or press Shift\+F10 for more options"] >> text=Virtual Meeting
    await page.locator('[aria-label="'+tabName+' Press Enter to select or press Shift\\+F10 for more options"] >> text='+tabName).click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/tab::3f6f4050-ae56-40d2-9a8a-6e4f143ddf42/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
}

/**
 * Sign in sign out in tab
 */
test('static tab', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    await navigateToTab(page,"Static");
    await waitInitialSceneLoadIframe(page);
    await stopErrorWatchTeams(page);
})

