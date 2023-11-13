import {container} from "./IOCConfig";
import {BasicModule} from "@aptero/axolotis-module-basic";
//import {TeamsModule} from "@aptero/axolotis-module-teams/index.async"; //TODO activate async to free some loading time
import {TeamsModule} from "@aptero/axolotis-module-teams";

export async function initIOC() {
    container.load(BasicModule());
    container.load(TeamsModule());
    console.log("IOC : loaded");
}
