import { isLocalHubsUrl, isLocalHubsSceneUrl, isHubsRoomUrl, isLocalHubsAvatarUrl } from "../utils/media-url-utils";
import { guessContentType } from "../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";
//aptero
import {setupIframeButton} from "../aptero/module/CustomPanel/react-component/openIframe";
import { duplicateEntryModeOnSrc } from "../aptero/module/HubsBridge/utils/EntryMode";
import { propertiesService } from "../aptero/module/properties/propertiesService";

//aptero
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

AFRAME.registerComponent("open-media-button", {
  schema: {
    onlyOpenLink: { type: "boolean" }
  },
  init() {
    this.label = this.el.querySelector("[text]");

    this.updateSrc = async () => {
      if (!this.targetEl.parentNode) return; // If removed
      const mediaLoader = this.targetEl.components["media-loader"].data;
      const src = (this.src = (mediaLoader.mediaOptions && mediaLoader.mediaOptions.href) || mediaLoader.src);
      const visible = src && guessContentType(src) !== "video/vnd.hubs-webrtc";
      const mayChangeScene = this.el.sceneEl.systems.permissions.canOrWillIfCreator("update_hub");

      //Aptero feature custom query string
      const wurl = new URL(window.location.href)
      const dirtyJson = wurl.searchParams.get("cqs")
      if(dirtyJson) {
        let correctJson = dirtyJson.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
        correctJson = correctJson.replaceAll("'", "\"")
        const qsJson = JSON.parse(correctJson);
        const newUrl = new URL(this.src);
        for (const entry in qsJson) {
          newUrl.searchParams.set(entry, qsJson[entry]);
        }
        console.log("custom link :"+newUrl.toString());
        this.src = newUrl.toString();
      }

      this.el.object3D.visible = !!visible;

      if (visible) {
        let label = "open link";
        if (!this.data.onlyOpenLink && isValidHttpUrl(src)) {
          let hubId;
          if (await isLocalHubsAvatarUrl(src)) {
            label = "use avatar";
          } else if ((await isLocalHubsSceneUrl(src)) && mayChangeScene) {
            label = "use scene";
          } else if ((hubId = await isHubsRoomUrl(src))) {
            const url = new URL(src);
            if (url.hash && window.APP.hub.hub_id === hubId) {
              label = "go to";
            } else {
              label = "visit room";
            }
          }
          else {
            //Aptero
            label = await setupIframeButton(this) || label;
          }
        }
        this.label.setAttribute("text", "value", label);

      }
    };

    this.onClick = async () => {
      const mayChangeScene = this.el.sceneEl.systems.permissions.canOrWillIfCreator("update_hub");
      const wurl = new URL(window.location.href);
      const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => {}, true);

      let hubId;
      if (this.data.onlyOpenLink) {
        await exitImmersive();
        window.open(this.src);
      } else if (await isLocalHubsAvatarUrl(this.src)) {
        const avatarId = new URL(this.src).pathname.split("/").pop();
        window.APP.store.update({ profile: { avatarId } });
        this.el.sceneEl.emit("avatar_updated");
      } else if ((await isLocalHubsSceneUrl(this.src)) && mayChangeScene) {
        this.el.sceneEl.emit("scene_media_selected", this.src);
      } else if ((hubId = await isHubsRoomUrl(this.src))) {
        let url = new URL(this.src);
        if (window.location.href.startsWith("https://localhost")) {
          url = "https://localhost:53000/hub.html?hub_id=" + hubId;
        }
        const wurlSearchParams = new URLSearchParams(wurl.searchParams);
        const urlSearchParams = new URLSearchParams(url.searchParams);
        for (const sp of [wurlSearchParams, urlSearchParams]) {
          sp.sort();
          //Ignore this list of option those should no prevent FRS since it does not change the content of the room
          sp.delete("hub_id");
          sp.delete("vr_entry_type");
          sp.delete("msteams");
          sp.delete("embed_token");
        }

        if (url.hash && window.APP.hub.hub_id === hubId) {
          // move to waypoint w/o writing to history
          window.history.replaceState(null, null, window.location.href.split("#")[0] + url.hash);
        } else if (
            window.APP_PROPS.APP_CONFIG.features.fast_room_switching &&
            //await isLocalHubsUrl(this.src) &&
            wurlSearchParams.toString() === urlSearchParams.toString() //If we have different option do not FRS
        ) {
          // move to new room without page load or entry flow
          const { changeHub } = await import("../change-hub");
          await changeHub(hubId);
        } else {
          //aptero
          this.src = duplicateEntryModeOnSrc(this.src, this.el.sceneEl);
          //await exitImmersive();
          location.href = this.src;
        }
      } else {
        await exitImmersive();
        window.open(this.src,"_blank","popup");
      }
    };

    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.targetEl = networkedEl;
      this.targetEl.addEventListener("media_resolved", this.updateSrc, { once: true });
      this.updateSrc();
    });
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  }
});
