// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {createWorld, Entity, LazyEntity, registerLocalModule} from "@aptero/axolotis-player";

//const { test, expect } = require('@playwright/test');
//https://dev.to/anishkny/code-coverage-for-a-nextjs-app-using-playwright-tests-18n7
import { test, expect } from './baseFixtures';

test('index.html', async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.screenshot({ path: './coverage/store/index.png' });
});

test('microsoft settings html', async ({ page }) => {
    await page.goto('microsoft-settings.html?msteams=true');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.screenshot({ path: './coverage/store/microsoft.png' });
});

test('playwright-test-1 html', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('hub.html?hub_id=EVa7SjZ&vr_entry_type=2d_now')
    await page.context().grantPermissions(['camera', 'microphone']);
    await page.evaluate(async () => {
        await new Promise(resolve => {
            window.document.addEventListener('apt:room:entered', resolve);
        })
    });
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.bringToFront();//important for microphone authorization
    await new Promise(resolve => setTimeout(resolve,5000));//TODO find a better event
    await page.screenshot({ path: './coverage/store/playwright-test-1.png' });
});

test('teams mode', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('hub.html?hub_id=EVa7SjZ&vr_entry_type=2d_now&msteams=true');
    await page.context().grantPermissions(['camera', 'microphone']);
    await page.evaluate(async () => {
        await new Promise(resolve => {
            window.document.addEventListener('apt:room:entered', resolve);
        })
    });
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.bringToFront();//important for microphone authorization
    await new Promise(resolve => setTimeout(resolve,5000));//TODO find a better event
    await page.screenshot({ path: './coverage/store/teams.png' });
});