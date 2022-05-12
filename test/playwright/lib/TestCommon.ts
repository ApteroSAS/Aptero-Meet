
export async function waitPageLoadedAll(page){
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load');
  await page.bringToFront();//important for microphone authorization
}

export async function waitInitialSceneLoad(page){
  await page.evaluate(async () => {
    await new Promise(resolve => {
      window.document.addEventListener('apt:room:entered', resolve);
    })
  });
  await waitPageLoadedAll(page);
  await new Promise(resolve => setTimeout(resolve,5000));//TODO find a better event
}

export async function treatConsoleWarnAsError(page){
  await page.evaluate(async () => {
    const oldWarn = console.warn;
    console.warn = (...args)=>{
      oldWarn(args);
      throw new Error("playwright console warn reporter");
    }
  });
}

export async function treatConsoleErrorAsError(page){
  await page.evaluate(async () => {
    const oldError = console.error;
    console.error = (...args)=>{
      oldError(args);
      throw new Error("playwright console error reporter");
    }
  });
}

export async function treatConsoleWarnAndErrorAsError(page){
  await treatConsoleWarnAsError(page);
  await treatConsoleErrorAsError(page);
}