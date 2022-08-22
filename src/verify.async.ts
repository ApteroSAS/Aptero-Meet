import {getService} from "@aptero/axolotis-player";
import {MICROSOFT_STATIC_SERVICE, PROPERTIES_SERVICE} from "./aptero/module/axolotis/modules/teams";

(async () => {
  const {initAxolotisPlayer} = await import("./aptero/module/axolotis/AxInit");
  await initAxolotisPlayer();

  await getService(PROPERTIES_SERVICE);
  await getService(MICROSOFT_STATIC_SERVICE);
  console.log("Start hub");
  await import("./verify.js");
  console.log("Start hub finished");
})();