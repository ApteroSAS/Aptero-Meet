import { waitForDOMContentLoaded } from "../utils/async-utils";

import "./module/ButtonAPI/component/custom-controller-button";
import "./module/ButtonAPI/component/media-limiter";
import "./module/CustomPanel/component/open-iframe-button";
import "./module/ButtonAPI/component/stop-share-screen-on-destroy";
import "./module/ButtonAPI/component/release-media-frame-on-destroy";
import "./module/AudioZone/component/trigger";
import { gltfExtensionProcessorService } from "./module/ButtonAPI/api/GLTFExtensionProcessorService";
import { AudioSettingsSystem } from "../systems/audio-settings-system";
import {redirectIfNeeded} from "./module/load-balancer/LoadBalancer";
//adapter
import { ThirdPersonService } from "./module/ThirdPerson/ThirdPersonService";
import { remoteControlServiceV2 } from "./module/RemoteScreen/RemoteControlServiceV2";
import { wait } from "./util/AsyncWaiter";
import { networkService } from "./module/HubsBridge/service/NetworkService";
import { roomParameters } from "./module/HubsBridge/service/RoomParameters";
import { tryMSMatchTheme } from "./module/microsoft/react-components/components/MSThemeMatcher";
import {container} from "./module/axolotis/IOCConfig";
import {HttpEventService, HttpEventServiceName} from "@aptero/axolotis-module-basic";
import {msTeamsAPILight} from "./module/axolotis/modules/basic/ImportHelper";
import {initIOC} from "./module/axolotis/AxInit";
import {FrontEndAPI} from "./module/FrontEndAPI/FrontEndAPI";

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
  private frontEndAPI: FrontEndAPI = new FrontEndAPI();
  private firstLoadProcessPromise: Promise<void>;

  constructor() {
    this.firstLoadProcessPromise = this.firstLoadProcess().then(() =>{
        console.log("firstLoadProcess done");
    } );
  }

  /**
   * This function is called as soon as possible to start the loading/redirecting process
   */
  async firstLoadProcess() {
    try {
      const prom = [];
      prom.push(redirectIfNeeded());//call as soon as possible
      prom.push((async () => {
        await initIOC();
        let teamsAPILight = msTeamsAPILight();
        console.log("teamsAPILight", teamsAPILight);
        teamsAPILight.redirectToTeamsSidePanel()
      })());
      prom.push(roomParameters.getRoomParameters()); //called as soon as possible
      await Promise.all(prom);
      this.frontEndAPI.attachToWindow();
    }catch (e) {
      console.error(e);
    }
  }

  start(audioSettingsSystem: AudioSettingsSystem) {
    this.audioSettingsSystem = audioSettingsSystem;
    waitForDOMContentLoaded().then(async () => {
      networkService.start();
      await gltfExtensionProcessorService.start();
      await this.thirdPersonService.start();
      await remoteControlServiceV2.start();
    });
  }

  async onEnterRoom() {
    window.fullyInRoom = false;
    await this.firstLoadProcessPromise;
    await wait(() => {
      return AFRAME && AFRAME.scenes && AFRAME.scenes[0] && AFRAME.scenes[0].systems;
    });
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
