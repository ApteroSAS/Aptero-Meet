import "@babel/polyfill";

import "aframe";
import "./utils/logging";
import {patchWebGLRenderingContext} from "./utils/webgl";
import "networked-aframe/src/index";
import "aframe-rounded";
import "webrtc-adapter";
import "aframe-slice9-component";
import "./utils/threejs-positional-audio-updatematrixworld";
import "./utils/threejs-world-update";
import "./utils/threejs-raycast-patches";
import "./phoenix-adapter";

import "./components/scene-components";
import "./components/scale-in-screen-space";
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
import "./components/media-views";
import "./components/avatar-volume-controls";
import "./components/pinch-to-move";
import "./components/pitch-yaw-rotator";
import "./components/position-at-border";
import "./components/pinnable";
import "./components/pin-networked-object-button";
import "./components/mirror-media-button";
import "./components/close-mirrored-media-button";
import "./components/drop-object-button";
import "./components/remove-networked-object-button";
import "./components/camera-focus-button";
import "./components/unmute-video-button";
import "./components/destroy-at-extreme-distances";
import "./components/visible-to-owner";
import "./components/camera-tool";
import "./components/emit-state-change";
import "./components/action-to-event";
import "./components/action-to-remove";
import "./components/emit-scene-event-on-remove";
import "./components/follow-in-fov";
import "./components/matrix-auto-update";
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
import "./components/set-active-camera";
import "./components/track-pose";
import "./components/replay";
import "./components/visibility-by-path";
import "./components/tags";
import "./components/billboard";
import "./components/periodic-full-syncs";
import "./components/inspect-button";
import "./components/inspect-pivot-child-selector";
import "./components/inspect-pivot-offset-from-camera";
import "./components/optional-alternative-to-not-hide";
import "./components/avatar-audio-source";
import "./components/avatar-inspect-collider";
import "./components/video-texture-target";
import "./components/audio-params";

import "./systems/nav";
import "./systems/frame-scheduler";
import "./systems/personal-space-bubble";
import "./systems/app-mode";
import "./systems/permissions";
import "./systems/exit-on-blur";
import "./systems/auto-pixel-ratio";
import "./systems/idle-detector";
import "./systems/camera-tools";
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

import {App} from "./App";
import {AdapterWarpper} from "./aptero/module/webRTCadapter/AdapterWrapper";
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
import {redirectIfNeeded} from "./aptero/module/load-balancer/LoadBalancer";
// A-Frame hardcodes THREE.Cache.enabled = true
// But we don't want to use THREE.Cache because
// web browser cache should work well.
// So we disable it here.
THREE.Cache.enabled = false;

patchWebGLRenderingContext();

// It seems we need to use require to import modules
// under the three/examples/js to avoid tree shaking
// in webpack production mode.
require("three/examples/js/loaders/GLTFLoader");

window.APP = new App();
window.APP.dialog = new AdapterWarpper();
window.APP.RENDER_ORDER = {
  HUD_BACKGROUND: 1,
  HUD_ICONS: 2,
  CURSOR: 3
}

declare const THREE;
THREE.Object3D.DefaultMatrixAutoUpdate = false;


declare const window;

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
      document.querySelector('a-scene').addEventListener('loaded', resolve)
    } catch (e) {
      reject(e);
    }
  })
}

export {};
(async () => {
  await redirectIfNeeded();
  const {initIOC} = await import("./aptero/module/axolotis/AxInit");
  await initIOC();
  console.log("Start hub");
  await domReady();
  console.log("dom loaded");
  await import("./hub.js");
  console.log("Start hub finished");
})();
