import "reflect-metadata";
import {Container} from "inversify";
import {ContainerModule} from "inversify";

import {SampleServiceB, SampleServiceBName} from "./modules/basic/SampleServiceB";
import {SampleServiceA, SampleServiceAName} from "./modules/basic/SampleServiceA";
import {CustomURL, CustomURLName} from "../customURL/CustomURL";

export const GenericModule = new ContainerModule((bind,unbind,)=>{
    //bind(HyperbeamService.name).to(HyperbeamService).inSingletonScope();
    //DEV NOTE: I don't know why but in this project you have to manually bind and instantiate the services
    bind(SampleServiceBName).toDynamicValue(()=> new SampleServiceB()).inSingletonScope();
    bind(SampleServiceAName).toDynamicValue((context)=>new SampleServiceA(context.container.get<SampleServiceB>(SampleServiceBName))).inSingletonScope();
    bind(CustomURLName).toDynamicValue(()=>new CustomURL()).inSingletonScope();
});

export const container = new Container();
container.load(GenericModule);

container.get<SampleServiceA>(SampleServiceAName);


