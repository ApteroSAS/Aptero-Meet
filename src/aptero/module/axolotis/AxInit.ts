import {container} from "./IOCConfig";
import {BasicModule, Properties, PROPERTIES_SERVICE,HttpEventServiceName,HttpEventService} from "@aptero/axolotis-module-basic";
//import {TeamsModule} from "@aptero/axolotis-module-teams/index.async"; //TODO activate async to free some loading time
import {TeamsModule} from "@aptero/axolotis-module-teams";
import {SampleServiceA, SampleServiceAName} from "./modules/basic/SampleServiceA";
import {GenericModule} from "./GenericModules";

export async function initIOC() {
    container.load(BasicModule());
    container.load(TeamsModule());
    container.load(GenericModule);
            // @ts-ignore
            // @ts-ignore
    console.log("IOC : loaded");
    //container.get<SampleServiceA>(SampleServiceAName);
    //console.log(container.get<Properties>(PROPERTIES_SERVICE).getGlobalProperties());
}