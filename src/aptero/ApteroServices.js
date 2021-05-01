import { liveStream } from "./service/LiveStream";
import { changeVideoService } from "./service/ChangeVideoService";
import { microsoftService } from "./service/MicrosoftService";
import { networkService } from "./service/NetworkService";
import { video360Service } from "./service/Video360Service";
import { waitForDOMContentLoaded } from "../utils/async-utils";

import "./component/custom-controller-button";
import "./component/rtmp-auto-refresh"
import "./component/media-limiter";
import { gltfExtensionProcessorService } from "./service/api/GLTFExtensionProcessorService";
import { staticObjectManipulator } from "./service/StaticObjectManipulator";
import { roomParameters } from "./service/RoomParameters";
//import DistributedSoundSystem from "./service/DistributedSoundSystem";
import SoundSystem from "./service/SoundSystem";

export class ApteroServices{
  constructor(){
  }

  async start(){
    waitForDOMContentLoaded().then(async () => {
      await networkService.start();
      await new SoundSystem(networkService).start();
      //await new DistributedSoundSystem(networkService).start();
      await changeVideoService.start();
      await liveStream.start();
      await microsoftService.start();
      await staticObjectManipulator.start();
      await video360Service.start();
      await gltfExtensionProcessorService.start();
    });
  }

  async onEnterRoom(roomSID) {
    await roomParameters.applyConfig(roomSID);
  }

  tick(){

  }

  remove(){

  }
}

export const apteroService = new ApteroServices();