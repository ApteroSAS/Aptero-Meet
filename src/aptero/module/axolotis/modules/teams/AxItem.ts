import { ModulePromise } from "@aptero/axolotis-player";
import { Item } from "@aptero/axolotis-player";
import { MICROSOFT_SERVICE, MICROSOFT_STATIC_SERVICE } from "./ImportHelper";

export class AxItem implements Item {
  constructor() {
    console.log("@aptero/axolotis-module-teams installed");
  }

  modules(): { [id: string]: ModulePromise } {
    let ret: { [id: string]: ModulePromise } = {};
    ret[MICROSOFT_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-teams");
      return { module, classname: "MsTeamsAPIFactory"/*module.MsTeamsAPIFactory.name*/};
    };
    ret[MICROSOFT_STATIC_SERVICE] = async () => {
      let module = await import("@aptero/axolotis-module-teams");
      return { module, classname: "MsTeamsAPILight" /*module.MsTeamsAPILight.name*/ };
    };
    return ret;
  }
}
