import {container} from "./IOCConfig";
import {BasicModule, Properties, PROPERTIES_SERVICE,HttpEventServiceName,HttpEventService} from "@aptero/axolotis-module-basic";
//import {TeamsModule} from "@aptero/axolotis-module-teams/index.async"; //TODO activate async to free some loading time
import {TeamsModule} from "@aptero/axolotis-module-teams";
import {SampleServiceA, SampleServiceAName} from "./modules/basic/SampleServiceA";
import {GenericModule} from "./GenericModules";
import {CustomURL, CustomURLName} from "../customURL/CustomURL";

let init:Promise<void> = null;

export function initIOC():Promise<void> {
    if(!init) {
        init = new Promise<void>((resolve) => {
            initIOCInternal();
            resolve();
        });
    }
    return init;
}

function initIOCInternal() {
    container.load(BasicModule());
    container.load(TeamsModule());
    container.load(GenericModule);
    console.log("IOC : loaded");
    //container.get<SampleServiceA>(SampleServiceAName);
    //console.log(container.get<Properties>(PROPERTIES_SERVICE).getGlobalProperties());
    container.get<CustomURL>(CustomURLName).processURL("");
}
