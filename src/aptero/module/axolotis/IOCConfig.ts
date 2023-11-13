import "reflect-metadata";
import {Container} from "inversify";
import {ContainerModule} from "inversify";

export const GenericModule = new ContainerModule((bind)=>{
    //bind(HyperbeamService.name).to(HyperbeamService).inSingletonScope();
});

export const container = new Container();
container.load(GenericModule);


