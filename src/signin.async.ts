import {getService} from "@aptero/axolotis-player";

(async () => {
  const {initAxolotisPlayer} = await import("./aptero/module/axolotis/AxInit");
  await initAxolotisPlayer();
  const {PROPERTIES_SERVICE,MICROSOFT_STATIC_SERVICE} = await import("@aptero/axolotis-module-teams");
  await getService(PROPERTIES_SERVICE);
  await getService(MICROSOFT_STATIC_SERVICE);
  console.log("Start hub");
  await import("./signin.js");
  console.log("Start hub finished");
})();