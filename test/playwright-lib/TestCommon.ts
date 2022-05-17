export async function waitPageLoadedAll(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    await page.bringToFront();//important for microphone authorization
}

export async function waitInitialSceneLoad(page) {
    await page.evaluate(async () => {
        await new Promise(resolve => {
            window.document.addEventListener('apt:room:entered', resolve);
        })
    });
    await waitPageLoadedAll(page);
    await new Promise(resolve => setTimeout(resolve, 5000));//TODO find a better event
}

export function treatConsoleWarnAsError(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            const oldWarn = console.warn;
            console.warn = (...args) => {
                oldWarn(args);
                reject("playwright console warn reporter");
            }
        });
    }).catch(async e => {
        await page.pause();
        throw new Error(e);
    });
}

export function treatConsoleErrorAsError(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            const oldError = console.error;
            console.error = (...args) => {
                oldError(args);
                reject("playwright console error reporter");
            }
        });
    }).catch(async e => {
        await page.pause();
        throw new Error(e);
    });
}

export function failsTheTestOnUnhandledError(page) {
    page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            // @ts-ignore
            window.onCancelPlayWrightEvaluate ? window.onCancelPlayWrightEvaluate.push(resolve): window.onCancelPlayWrightEvaluate = [resolve];
            const oldOnerror = window.onerror
            window.onerror = (...args) => {
                reject("playwright console error reporter");
                return oldOnerror(...args);
            }
        });
    }).catch(async e => {
        await page.pause();
        throw new Error(e);
    });
}

export function startErrorWatchTeams(page){
  failsTheTestOnUnhandledError(page);
  treatConsoleErrorAsError(page);
}

export async function stopErrorWatch(page){
    await page.evaluate(async () => {
        // @ts-ignore
        for(const cancel of window.onCancelPlayWrightEvaluate){
            cancel();
        }
    });
}