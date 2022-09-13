import { getGlobalStorageValue, GLOBAL_WORLDS_ENTITY, registerItem, WorldEntity } from "@aptero/axolotis-player";
import { AxItem } from "./AxItem";

export type { MsTeamsAPILight } from "@aptero/axolotis-module-teams/build/indexLight";
export type { MsTeamsAPI } from "@aptero/axolotis-module-teams";
export type { MicrosoftLoginService } from "@aptero/axolotis-module-teams";

export * from "./ImportHelper";

export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";
export const MSTEAMS_QUERY_PARAM = "msteams";

export const register = () => {
  const worlds = getGlobalStorageValue<WorldEntity[]>(GLOBAL_WORLDS_ENTITY, false);
  if (!(worlds && worlds.length > 0)) {
    throw new Error("Axolotis World Needs to be initialized");
  }
  registerItem(new AxItem()); //auto registration of service
};
