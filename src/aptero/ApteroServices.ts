import { liveStream } from "./module/video360/LiveStream";
import { video360Service } from "./module/video360/Video360Service";
import { waitForDOMContentLoaded } from "../utils/async-utils";

import "./module/ButtonAPI/component/custom-controller-button";
import "./module/HubsBridge/component/rtmp-auto-refresh";
import "./module/ButtonAPI/component/media-limiter";
import "./module/CustomPanel/component/open-iframe-button";
import "./module/ButtonAPI/component/stop-share-screen-on-destroy";
import "./module/ButtonAPI/component/release-media-frame-on-destroy";
import "./module/AudioZone/component/trigger";
import { gltfExtensionProcessorService } from "./module/ButtonAPI/api/GLTFExtensionProcessorService";
//import DistributedSoundSystem from "./service/DistributedSoundSystem";
import SoundSystem from "./module/DistributedSound/SoundSystem";
import { AudioSettingsSystem } from "./../systems/audio-settings-system";

//adapter
import "./module/webRTCadapter/adapter-config";
import { ThirdPersonService } from "./module/ThirdPerson/ThirdPersonService";
import { minimumQualityService } from "./module/perf/MinimumQualityService";
import { testServiceNotifySceneEntered, startSelfTest, testTick } from "./module/TestHelper/SelfTestService.loader";
import { setlistenerEndShareVideo } from "./module/webRTCadapter/adapter-config";
import { remoteControlServiceV2 } from "./module/RemoteScreen/RemoteControlServiceV2";
import { wait } from "./util/AsyncWaiter";
import { networkService } from "./module/HubsBridge/service/NetworkService";
import { roomParameters } from "./module/HubsBridge/service/RoomParameters";
import { tryMSMatchTheme } from "./module/microsoft/react-components/components/MSThemeMatcher";
import {container} from "./module/axolotis/IOCConfig";
import {HttpEventService, HttpEventServiceName} from "@aptero/axolotis-module-basic";

declare let window:any;
declare let AFRAME:any;

export const ENTERED_EVENT = 'apt:room:entered';

function sendIframeMessage(type:string, data:any) {
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(JSON.stringify({type, data}), "*");
  }
}

//event handling for iframe #morgane
window.focus();
window.addEventListener(
  "keydown",
  function(e:KeyboardEvent) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  },
  false
);
window.addEventListener(
  "keydown",
  function(e:KeyboardEvent) {
    if (["space"].indexOf(e.code) > -1) {
      e.stopPropagation();
    }
  },
  false
);
if (new URL(window.location.href).searchParams.get("hideui")) {
  //no space button if hide ui mode
  window.addEventListener(
    "keydown",
    function(e:KeyboardEvent) {
      if (["Space"].indexOf(e.code) > -1) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );
}
/*window.addEventListener("scroll", function(e) {
  e.preventDefault();
});*/

export class ApteroServices {
  thirdPersonService = new ThirdPersonService();
  private audioSettingsSystem: any;
  private sceneEntered: boolean = false;
  constructor() {
    startSelfTest();
    roomParameters.getRoomParameters(); //called as soon as possible
  }

  start(audioSettingsSystem: AudioSettingsSystem) {
    this.audioSettingsSystem = audioSettingsSystem;
    waitForDOMContentLoaded().then(async () => {
      await networkService.start();
      await new SoundSystem(networkService).start();
      //await new DistributedSoundSystem(networkService).start();
      await liveStream.start();
      //await microsoftService.start(); //TODO Warning produce lots of payload in hub-vendor => lazy load this
      await video360Service.start();
      await gltfExtensionProcessorService.start();
      await this.thirdPersonService.start();
      await remoteControlServiceV2.start();
    });
  }

  async onEnterRoom() {
    window.fullyInRoom = false;
    console.log("FIRST ENTRANCE")
    await wait(() => {
      return AFRAME && AFRAME.scenes && AFRAME.scenes[0] && AFRAME.scenes[0].systems;
    });
    await setlistenerEndShareVideo();
    await roomParameters.applyRoomParameters();
    await wait(() => {
      return this.audioSettingsSystem;
    });
    await roomParameters.applyDefaultAudioSettingsSystem(this.audioSettingsSystem);
    window.document.dispatchEvent(new Event(ENTERED_EVENT))
    await tryMSMatchTheme();
    sendIframeMessage(ENTERED_EVENT,{});
    setTimeout(() => {
      try {
        const qs = new URLSearchParams(window.location.search);
        const roomSID = qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0] || window.APP?.hub?.hub_id;
        const roomName = window.APP?.hub?.name;
        container.get<HttpEventService>(HttpEventServiceName).trackEvent("room_entered", {
          roomsid: roomSID,
          roomName: roomName,
          accontid: window.APP.store.credentialsAccountId,
          email: window.APP?.store?.state?.credentials?.email,
          name: window.APP?.store?.state?.profile?.displayName,
          version: process.env.BUILD_VERSION,
        });
      } catch (e) {
        //log error but don't block
        console.error(e);
      }
    },30000);//must be at least a 30s session to count
  }

  tick() {
    minimumQualityService.tick();
    testTick();
  }

  async remove() {
    await this.thirdPersonService.stop();
  }

  notifySceneEntered() {
    if(this.sceneEntered){
      console.error("notifySceneEntered called multiple times");
      return;
    }
    this.sceneEntered = true;
    minimumQualityService.initialCheckFinished();
    testServiceNotifySceneEntered();
    setTimeout(() => {
      this.thirdPersonService.storeUpdated();
      sendIframeMessage("entered", {});
    }, 1000);
    window.dispatchEvent(new CustomEvent("apt_scene_entered", {}));
    setTimeout(() => {
      window.fullyInRoom = true;
      console.log("FULLY IN ROOM!")
    }, 100);
  }

  notifyLoadingState(state:any, action:any) {
    sendIframeMessage("loading", { state, action });
  }
}

export let apteroService = new ApteroServices();
