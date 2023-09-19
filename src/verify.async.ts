import {getService} from "@aptero/axolotis-player";

(async () => {
  const {initAxolotisPlayer} = await import("./aptero/module/axolotis/AxInit");
  await initAxolotisPlayer();
  console.log("Start hub");
  await import("./verify.js");
  console.log("Start hub finished");
})();