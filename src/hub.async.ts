import "@babel/polyfill";

import "aframe";
import "./utils/aframe-overrides";
// A-Frame hardcodes THREE.Cache.enabled = true
// But we don't want to use THREE.Cache because
// web browser cache should work well.
// So we disable it here.
import * as THREE from "three";
THREE.Cache.enabled = false;
THREE.Object3D.DefaultMatrixAutoUpdate = false;

import "./utils/logging";
import {patchWebGLRenderingContext} from "./utils/webgl";
patchWebGLRenderingContext();

import "networked-aframe/src/index";
import "webrtc-adapter";
import "./phoenix-adapter";/*Aptero dependance pour components*/

import "./components/scene-components";
import "./components/mute-mic";
import "./components/bone-mute-state-indicator";
import "./components/bone-visibility";
import "./components/fader";
import "./components/in-world-hud";
import "./components/emoji";
import "./components/emoji-hud";
import "./components/virtual-gamepad-controls";
import "./components/ik-controller";
import "./components/hand-controls2";
import "./components/hoverable-visuals";
import "./components/hover-visuals";
import "./components/offset-relative-to";
import "./components/player-info";
import "./components/name-tag";
import "./components/debug";
import "./components/hand-poses";
import "./components/hud-controller";
import "./components/freeze-controller";
import "./components/icon-button";
import "./components/text-button";
import "./components/block-button";
import "./components/mute-button";
import "./components/kick-button";
import "./components/close-vr-notice-button";
import "./components/leave-room-button";
import "./components/visible-if-permitted";
import "./components/visibility-on-content-types";
import "./components/hide-when-pinned-and-forbidden";
import "./components/visibility-while-frozen";
import "./components/stats-plus";
import "./components/networked-avatar";
import "./components/media-video";
import "./components/media-pdf";
import "./components/media-image";
import "./components/avatar-volume-controls";
import "./components/pinch-to-move";
import "./components/pitch-yaw-rotator";
import "./components/position-at-border";
import "./components/pinnable";
import "./components/pin-networked-object-button";
import "./components/mirror-media-button";
import "./components/close-mirrored-media-button";
import "./components/drop-object-button";
import "./components/camera-focus-button";
import "./components/unmute-video-button";
import "./components/visible-to-owner";
import "./components/emit-state-change";
import "./components/action-to-event";
import "./components/action-to-remove";
import "./components/emit-scene-event-on-remove";
import "./components/follow-in-fov";
import "./components/clone-media-button";
import "./components/open-media-button";
import "./components/refresh-media-button";
import "./components/tweet-media-button";
import "./components/remix-avatar-button";
import "./components/transform-object-button";
import "./components/scale-button";
import "./components/hover-menu";
import "./components/disable-frustum-culling";
import "./components/teleporter";
import "./components/track-pose";
import "./components/replay";
import "./components/visibility-by-path";
import "./components/tags";
import "./components/periodic-full-syncs";
import "./components/inspect-button";
import "./components/inspect-pivot-child-selector";
import "./components/inspect-pivot-offset-from-camera";
import "./components/optional-alternative-to-not-hide";
import "./components/avatar-audio-source";
import "./components/avatar-inspect-collider";
import "./components/video-texture-target";
import "./components/mirror";

import "./systems/nav";
import "./systems/frame-scheduler";
import "./systems/personal-space-bubble";
import "./systems/app-mode";
import "./systems/permissions";
import "./systems/exit-on-blur";
import "./systems/auto-pixel-ratio";
import "./systems/idle-detector";
import "./systems/pen-tools";
import "./systems/userinput/userinput";
import "./systems/userinput/userinput-debug";
import "./systems/ui-hotkeys";
import "./systems/tips";
import "./systems/interactions";
import "./systems/hubs-systems";
import "./systems/capture-system";
import "./systems/listed-media";
import "./systems/linked-media";
import "./systems/audio-debug-system";
import "./systems/audio-gain-system";

import "./gltf-component-mappings";

//Aptero support for multiple Adapters
import {AdapterWrapper} from "./aptero/module/webRTCadapter/AdapterWrapper";
import { App, getScene } from "./app";
import MediaDevicesManager from "./utils/media-devices-manager";
import PinningHelper from "./utils/pinning-helper";
import { sleep } from "./utils/async-utils";
import { platformUnsupported } from "./support";
import { renderAsEntity } from "./utils/jsx-entity";
import { VideoMenuPrefab } from "./prefabs/video-menu";
import { ObjectMenuPrefab } from "./prefabs/object-menu";
import { loadWaypointPreviewModel, WaypointPreview } from "./prefabs/waypoint-preview";
import { preload } from "./utils/preload";

window.APP = new App();
window.APP.dialog = new AdapterWrapper() as unknown as DialogAdapter; // Aptero
renderAsEntity(APP.world, VideoMenuPrefab());
renderAsEntity(APP.world, VideoMenuPrefab());
function addToScene(entityDef, visible) {
  return getScene().then(scene => {
    const eid = renderAsEntity(APP.world, entityDef);
    const obj = APP.world.eid2obj.get(eid);
    if (!obj) return;
    scene.add(obj);
    obj.visible = !!visible;
  });
}

import "./components/owned-object-limiter";
import "./components/owned-object-cleanup-timeout";
import "./components/set-unowned-body-kinematic";
import "./components/scalable-when-grabbed";
import "./components/networked-counter";
import "./components/event-repeater";
import "./components/set-yxz-order";

import "./components/cursor-controller";

import "./components/nav-mesh-helper";

import "./components/tools/pen";
import "./components/tools/pen-laser";
import "./components/tools/networked-drawing";
import "./components/tools/drawing-manager";

import "./components/body-helper";
import "./components/shape-helper";

//ax
import {getService} from "@aptero/axolotis-player"
import {MICROSOFT_STATIC_SERVICE, PROPERTIES_SERVICE} from "@aptero/axolotis-module-teams";
import {redirectIfNeeded} from "./aptero/module/load-balancer/LoadBalancer";
import { Object3D } from "three";
import DialogAdapter from "./aptero/module/webRTCadapter/naf-dialog-io-adapter";


async function domReady() {
  return new Promise((resolve, reject) => {
    try {
      // If we're early to the party
      document.addEventListener("DOMContentLoaded", resolve);
      // If late; I mean on time.
      if (document.readyState === "interactive" || document.readyState === "complete") {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  })
}

async function aframeReady() {
  return new Promise((resolve, reject) => {
    try {
      document.querySelector('a-scene')!.addEventListener('loaded', resolve)
    } catch (e) {
      reject(e);
    }
  })
}

export {};
(async () => {
  await redirectIfNeeded();
  const {initAxolotisPlayer} = await import("./aptero/module/axolotis/AxInit");
  await initAxolotisPlayer();
  await getService(PROPERTIES_SERVICE);
  await getService(MICROSOFT_STATIC_SERVICE);
  console.log("Start hub");
  await domReady();
  console.log("dom loaded");
  await import("./hub.js");
  console.log("Start hub finished");
})();
