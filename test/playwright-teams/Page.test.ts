// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createWorld, Entity, LazyEntity, registerLocalModule} from "@aptero/axolotis-player";

//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from '../playwright-lib/baseFixtures';
import { treatConsoleErrorAsError, waitInitialSceneLoad, waitPageLoadedAll } from "../playwright-lib/TestCommon";
import {
    accountHint,
    initialConnexion,
    localTeamsAppId,
    navigateToTab,
    startErrorWatchTeams, stopErrorWatch,
    tenant, waitInitialSceneLoadIframe
} from "../playwright-lib/TeamsTest";



/**
 * Create a tab
 */
test('teams setting up', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/l/app/'+localTeamsAppId+'?installAppPackage=true&webjoin=true&appTenantId='+tenant+'&login_hint='+accountHint);
    await initialConnexion(page,true);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page

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
    await page.waitForLoadState('networkidle');

    //Focus virtual meeting
    // Click text=Virtual Meeting
    await page.locator('text=Virtual Meeting').click();
    // Click text=Virtual Meeting
    await page.locator('text=Virtual Meeting').click();
    await page.waitForLoadState('networkidle');

    // Click [aria-label="More"]
    await page.frameLocator('iframe[name="embedded-page-container"]').locator('[aria-label="More"]').click();


    await stopErrorWatch(page);

});

/**
 * Sign in sign out in tab
 */
test('teams sign in / sign out', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    await navigateToTab(page);
    await waitInitialSceneLoadIframe(page);
    //TODO sign in sign out
    await stopErrorWatch(page);
})

/**
 * Remove Tab
 */
test('teams cleanup', async ({ page }) => {
    test.setTimeout(4*60*1000);
    await page.goto('https://teams.microsoft.com/');
    await initialConnexion(page);
    await startErrorWatchTeams(page);//after initial connexion to avoid reload page
    await navigateToTab(page);
    // Click text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"] >> nth=2
    await page.locator('text=PostsFilesWikiVirtual Meeting >> svg[role="presentation"]').nth(2).click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
    // Click button:has-text("Remove")
    await page.locator('button:has-text("Remove")').click();
    await stopErrorWatch(page);
});


