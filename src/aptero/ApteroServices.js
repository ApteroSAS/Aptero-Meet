import { liveStream } from "./service/LiveStream";
import { changeVideoService } from "./service/ChangeVideoService";
import { microsoftService } from "./service/MicrosoftIntegration/MicrosoftService";
import { networkService } from "./service/NetworkService";
import { video360Service } from "./service/Video360Service";
import { waitForDOMContentLoaded } from "../utils/async-utils";


import "./component/custom-controller-button";
import "./component/rtmp-auto-refresh";
import "./component/media-limiter";
import { gltfExtensionProcessorService } from "./service/api/GLTFExtensionProcessorService";
import { staticObjectManipulator } from "./service/StaticObjectManipulator";
import { roomParameters } from "./service/RoomParameters";
//import DistributedSoundSystem from "./service/DistributedSoundSystem";
import SoundSystem from "./service/SoundSystem";


//adapter
import "./adapter/adapter-config";
import { ThirdPersonService } from "./service/ThirdPersonService";
import {aptLogger} from "./service/log/Logger";
import { startSelfTest } from "./service/SelfTestService";
import { minimumQualityService } from "./service/MinimumQualityService";

//event handling for iframe #morgane
window.focus();
window.addEventListener("keydown", function(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
window.addEventListener("keydown", function(e) {
  if (["space"].indexOf(e.code) > -1) {
    e.stopPropagation();
  }
}, false);
if((new URL(window.location.href).searchParams.get("hideui"))) {
  //no space button if hide ui mode
  window.addEventListener("keydown", function(e) {
    if (["Space"].indexOf(e.code) > -1) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}
/*window.addEventListener("scroll", function(e) {
  e.preventDefault();
});*/


function sendIframeMessage(type,data){
  if(window.top){
    window.top.postMessage(JSON.stringify({type,data}), '*')
  }
}

export class ApteroServices {
  thirdPersonService = new ThirdPersonService();
  constructor() {
    startSelfTest();
    roomParameters.getRoomParameters();//called as soon as possible
    aptLogger.setProperties(window.APP_CONFIG.LOGGER);
    aptLogger.setAdditionalData("version",process.env.BUILD_VERSION);
  }

  applySoftRedirect() {
    if (window.location.host === "hub.aptero.co") {
      window.location.href = window.location.href.replace("hub.aptero.co", "meet.aptero.co");
    }
  }

  start(audioSettingsSystem) {
    this.audioSettingsSystem = audioSettingsSystem;
    waitForDOMContentLoaded().then(async () => {
      await networkService.start();
      await new SoundSystem(networkService).start();
      //await new DistributedSoundSystem(networkService).start();
      await changeVideoService.start();
      await liveStream.start();
      //await microsoftService.start(); //TODO Warning produce lots of payload in hub-vendor
      await staticObjectManipulator.start();
      await video360Service.start();
      await gltfExtensionProcessorService.start();
      await this.thirdPersonService.start();
      await aptLogger.start();
    });
  }

  async waitAudioSettingsSystem() {
    return new Promise((resolve, reject) => {
      if (this.audioSettingsSystem) {
        resolve();
      } else {
        setTimeout(() => {
          if (!this.audioSettingsSystem) {
            this.waitAudioSettingsSystem();
            resolve();
          }
        }, 200);
      }
    });
  }

  async onEnterRoom() {
    await roomParameters.applyRoomParameters();
    aptLogger.setUserId(window.APP.store.credentialsAccountId);
    const qs = new URLSearchParams(window.location.search);
    const roomSID = qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0];
    aptLogger.track("room_entered",{
      datastr:roomSID,
      roomsid:roomSID,
      email:window.APP?.store?.state?.credentials?.email,
      name:window.APP?.store?.state?.profile?.displayName
    });
    await this.waitAudioSettingsSystem();
    await roomParameters.applyDefaultAudioSettingsSystem(this.audioSettingsSystem);
  }

  tick() {
    minimumQualityService.tick();
  }

  async remove() {
    await this.thirdPersonService.stop();
  }

  notifySceneEntered() {
    minimumQualityService.initialCheckFinished();
    setTimeout(()=>{
      this.thirdPersonService.storeUpdated();
      sendIframeMessage("entered",{});
    },1000);
  }

  notifyLoadingState(state, action) {
    sendIframeMessage("loading",{state,action})
  }
}

export const apteroService = new ApteroServices();
