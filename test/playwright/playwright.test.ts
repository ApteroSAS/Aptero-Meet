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

test('playwright-test-1 html', async ({ page }) => {
    await page.goto('hub.html?hub_id=EVa7SjZ/playwright-test-1');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.screenshot({ path: './coverage/store/playwright-test-1.png' });
});

https://alphahub.aptero.co/EVa7SjZ/playwright-test-1

test('get.webgl.org', async ({ page }) => {
    await page.goto('https://get.webgl.org/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.screenshot({ path: './coverage/store/webgl.png' });
});