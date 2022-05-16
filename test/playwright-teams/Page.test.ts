// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createWorld, Entity, LazyEntity, registerLocalModule} from "@aptero/axolotis-player";

//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import { treatConsoleErrorAsError, waitInitialSceneLoad, waitPageLoadedAll } from "../playwright-lib/TestCommon";

import localJson from './../../.fx/states/state.local.json';
const localTeamsAppId = localJson["fx-resource-appstudio"].teamsAppId;
const tenant = "48caed5d-d20d-40ce-b0cd-9261fc5d8f83";
const accountHint = "test1@aptero.co";
const password = "Lub09002";

async function navigateToTab(page){
    // Click [aria-label="Teams Toolbar"]
    await page.locator('[aria-label="Teams Toolbar"]').click();
    // Click [aria-label="Your teams"] ng-include div:has-text("General")
    await page.locator('[aria-label="Your teams"] ng-include div:has-text("General")').click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/conversations/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
    // Click [aria-label="Virtual Meeting Press Enter to select or press Shift\+F10 for more options"] >> text=Virtual Meeting
    await page.locator('[aria-label="Virtual Meeting Press Enter to select or press Shift\\+F10 for more options"] >> text=Virtual Meeting').click();
    // assert.equal(page3.url(), 'https://teams.microsoft.com/_#/tab::3f6f4050-ae56-40d2-9a8a-6e4f143ddf42/General?threadId=19:LsdNx7OQvs6oxFE2Ro5hLOMTC1lHYmaE_Ee-Kpr_6PI1@thread.tacv2&ctx=channel');
}

async function initialConnexion(page,withHint=false){
    if(!withHint) {
        // Click [placeholder="Email\, phone\, or Skype"]
        await page.locator('[placeholder="Email\\, phone\\, or Skype"]').click();
        // Fill [placeholder="Email\, phone\, or Skype"]
        await page.locator('[placeholder="Email\\, phone\\, or Skype"]').fill(accountHint);
        // Click text=Next
        await Promise.all([
            page.waitForNavigation(/*{ url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=id_token&scope=openid%20profile&client_id=5e3ce6c0-2b1f-4285-8d4b-75ee78787346&redirect_uri=https%3A%2F%2Fteams.microsoft.com%2Fgo&state=eyJpZCI6ImI0NjE5Yzg4LTlkNjktNDBkNS1iNmEwLTVkZDRlMWE5N2Q0MSIsInRzIjoxNjUyNzE2OTc0LCJtZXRob2QiOiJyZWRpcmVjdEludGVyYWN0aW9uIn0%3D&nonce=8ef48112-074b-4cf8-8d1e-e0d28f723b7c&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=1.3.4&client-request-id=946004bb-b9d0-487e-b24a-3c9b80fe9756&response_mode=fragment&sso_reload=true' }*/),
            page.locator('text=Next').click()
        ]);
    }
    // Click [placeholder="Password"]
    await page.locator('[placeholder="Password"]').click();
    // Fill [placeholder="Password"]
    await page.locator('[placeholder="Password"]').fill(password);
    // Click text=Sign in
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://login.microsoftonline.com/common/login' }*/),
        page.locator('text=Sign in').click()
    ]);
    // Check [aria-label="Don\'t show this again"]
    await page.locator('[aria-label="Don\\\'t show this again"]').check();
    // Click text=Yes
    await Promise.all([
        page.waitForNavigation(/*{ url: 'https://teams.microsoft.com/_' }*/),
        page.locator('text=Yes').click()
    ]);
}

/**
 * Create a tab
 */
test('teams setting up', async ({ page }) => {
    await page.goto('https://teams.microsoft.com/l/app/'+localTeamsAppId+'?installAppPackage=true&webjoin=true&appTenantId='+tenant+'&login_hint='+accountHint);
    await waitPageLoadedAll(page);
    await treatConsoleErrorAsError(page);
    await initialConnexion(page,true);

    // Click text=Add to a team
    await page.locator('text=Add to a team').click();
    // Click #tcp-input-id
    await page.locator('#tcp-input-id').click();
    // Fill text=Type a team or channel name General Ci Test >> [placeholder="Search"]
    await page.locator('text=Type a team or channel name General Ci Test >> [placeholder="Search"]').fill('Ci test');
    // Click button:has-text("General Ci Test")
    await page.locator('button:has-text("General Ci Test")').click();
    // Click text=Set up a tab
    await page.locator('text=Set up a tab').click();

    //https://playwright.dev/docs/api/class-framelocator
    const frame = page.frameLocator('iframe[name="embedded-page-container"]');
    await frame.locator('button:has-text("Sign In")').click();

    // Click text=My Room
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('text=My Room').click();
    // Click text=StarPeople 0Playwright - EmptyJoined 3 minutes ago
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('img[alt="Playwright - Empty"]').click();

    await page.locator('[aria-label="Save"]').click();

});

/**
 * Sign in sign out in tab
 */
test('teams sign in / sign out', async ({ page }) => {
    await page.goto('https://teams.microsoft.com/');
    await waitPageLoadedAll(page);
    await treatConsoleErrorAsError(page);
    await initialConnexion(page);
    await navigateToTab(page);
})

/**
 * Remove Tab
 */
test('teams cleanup', async ({ page }) => {
    await page.goto('https://teams.microsoft.com/');
    await waitPageLoadedAll(page);
    await treatConsoleErrorAsError(page);
    await initialConnexion(page);
    await navigateToTab(page);
    // Click text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"] >> nth=2
    await page.locator('text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"]').nth(2).click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
});


