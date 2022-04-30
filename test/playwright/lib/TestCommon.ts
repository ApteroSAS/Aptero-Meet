
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