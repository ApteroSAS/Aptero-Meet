import { networkService } from "../NetworkService";
import { pinEntity, spawnMediaInfrontOfPlayer, unpinEntity } from "../../util/Media";
import { ObjectContentOrigins } from "../../../object-types";
import { ActionAnimationController } from "./ActionAnimationController";
import { roomController } from "./RoomController";
import { mediaViewEventEmitter } from "../../../components/media-views";
import axios from "axios";
import { applyPersistentSync } from "../../../utils/permissions-utils";

export class CustomActionRegister {
  actions = {};
  triggers = {};

  constructor() {
    this.actionAnimationController = new ActionAnimationController();
  }

  async start() {
    this.actionAnimationController.init();
  }

  setup(htmlElement, action, actionid) {
    if (action.type === "animation") {
      this.actionAnimationController.setup(htmlElement, action, actionid);
    }
    this.actions[actionid] = { action: action };
  }

  async handleEntry(entry) {
    return new Promise((resolve, reject) => {
      if (entry.camera || entry.shareScreen) {
        mediaViewEventEmitter.once("share_video_media_stream_created", (data) => {
          let entity = spawnMediaInfrontOfPlayer(data.src, ObjectContentOrigins.URL, null);
          let pool = () => {
            if (!(entity.object3D && entity.getObject3D("mesh"))) {
              setTimeout(pool, 500);
            } else {
              resolve(entity);
              entity.sceneEl.addEventListener("action_end_video_sharing", () => {
                if (entity.parentNode) {
                  entity.parentNode.removeChild(entity);
                }
              }, { once: true });
            }
          };
          setTimeout(pool, 500);
        });
      } else {
        resolve(spawnMediaInfrontOfPlayer(entry.url, entry.contentOrigin, null));
      }
    });
  }

  async applyAudio(entity, actionData) {
    entity.addEventListener("media-loaded", () => {
      let mediaVideo = entity.components["media-video"];
      if (mediaVideo && actionData.action.audio) {
        let initialSettings = mediaVideo.data;
        entity.setAttribute("media-video", {
          distanceModel: actionData.action.audio.distanceModel || initialSettings.distanceModel,
          rolloffFactor: actionData.action.audio.rolloffFactor || initialSettings.rolloffFactor,
          refDistance: actionData.action.audio.refDistance || initialSettings.refDistance,
          maxDistance: actionData.action.audio.maxDistance || initialSettings.maxDistance,
          coneInnerAngle: actionData.action.audio.coneInnerAngle || initialSettings.coneInnerAngle,
          coneOuterAngle: actionData.action.audio.coneOuterAngle || initialSettings.coneOuterAngle,
          coneOuterGain: actionData.action.audio.coneOuterGain || initialSettings.coneOuterGain
        });
        entity.setAttribute("media-loader", {
          mediaOptions: {
            distanceModel: actionData.action.audio.distanceModel || initialSettings.distanceModel,
            rolloffFactor: actionData.action.audio.rolloffFactor || initialSettings.rolloffFactor,
            refDistance: actionData.action.audio.refDistance || initialSettings.refDistance,
            maxDistance: actionData.action.audio.maxDistance || initialSettings.maxDistance,
            coneInnerAngle: actionData.action.audio.coneInnerAngle || initialSettings.coneInnerAngle,
            coneOuterAngle: actionData.action.audio.coneOuterAngle || initialSettings.coneOuterAngle,
            coneOuterGain: actionData.action.audio.coneOuterGain || initialSettings.coneOuterGain
          }
        });
        applyPersistentSync(entity.components["networked"].data.networkId);
      }
    }, { once: true });
  }

  async convertToNetEntity(entity) {
    return new Promise(async (resolve, reject) => {
      NAF.utils.getNetworkedEntity(entity).then(networkedEl => {
        if (!NAF.utils.isMine(networkedEl)) {
          NAF.utils.takeOwnership(networkedEl);
        }
        resolve(networkedEl);
      });
    });
  }

  onReady(entity, callback) {
    if (entity.getObject3D("mesh") && entity.getObject3D("mesh").scale) {
      callback();
    } else {
      const promise1 = new Promise((resolve, reject) => {
        entity.addEventListener("media-loaded", resolve);
      });
      const promise2 = new Promise((resolve, reject) => {
        setTimeout(resolve, 800);
      });
      Promise.race([promise1, promise2]).then((value) => {
        callback();
      });
    }
  }

  async spawnAttach(actionData, entry) {
    let mediaFrame = await this.findMediaFrameByName(actionData.action.mediaFrame);
    if (mediaFrame && mediaFrame.components["media-frame"]) {
      await this.removeOldMediaFrameEntity(mediaFrame);
      let entity = await new Promise(async (resolve, reject) => {
        let entity = await this.handleEntry(entry);

        this.applyAudio(entity, actionData);
        resolve(await this.convertToNetEntity(entity));
      });
      this.onReady(entity, async () => {
        setTimeout(async () => {
          let mediaFrameComponent = mediaFrame.components["media-frame"];
          mediaFrameComponent.capture(entity);
          //TODO tmp force pin
          //actionData.action.pin = true;
          if (actionData.action.pin) {
            await pinEntity(entity);
          }
          applyPersistentSync(entity.components["networked"].data.networkId);
          applyPersistentSync(mediaFrame.components["networked"].data.networkId);
        }, 0);
      });
    } else {
      console.error("invalid media frame target");
    }
  }

  async removeOldMediaFrameEntity(mediaFrame) {
    return new Promise(async (resolve, reject) => {
      if (mediaFrame && mediaFrame.components["media-frame"]) {
        let mediaFrameComponent = mediaFrame.components["media-frame"];
        const capturedEl = document.getElementById(mediaFrameComponent.data.targetId);
        if (capturedEl) {
          const scene = capturedEl.sceneEl;
          if (capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
            //hubs:// is the protocole for sharescreen and webcam media
            scene.emit("action_end_video_sharing");
          }
        }
        mediaFrameComponent.release();
        if (capturedEl) {
          NAF.utils.getNetworkedEntity(capturedEl).then(async networkedEl => {
            if (!NAF.utils.isMine(networkedEl)) {
              NAF.utils.takeOwnership(networkedEl);
            }
            //unpin
            if(!capturedEl.components["media-video"].data.src.startsWith("hubs://")) {
              await unpinEntity(networkedEl);
            }
            //start remove animation
            networkedEl.setAttribute("animation__remove", {
              property: "scale",
              dur: 200,
              to: { x: 0.01, y: 0.01, z: 0.01 },
              easing: "easeInQuad"
            });
            const promise1 = new Promise((resolve2) => {
              networkedEl.addEventListener("animationcomplete", () => {
                if (networkedEl.parentNode) {
                  networkedEl.parentNode.removeChild(networkedEl);
                }
                resolve2();
              });
            });
            const promise2 = new Promise((resolve2) => {
              setTimeout(resolve2, 1000);
            });
            Promise.race([promise1, promise2]).then(() => {
              resolve();
            });
          }).catch(() => {
            capturedEl.parentNode.removeChild(capturedEl);
            resolve();
          }).catch(() => {
            capturedEl.remove();
            resolve();
          });
        } else {
          resolve();
        }
      } else {
        console.error("invalid media frame target");
        reject();
      }
    });
  }

  async findMediaFrameByName(name) {
    return new Promise((resolve, reject) => {
      let mediaFrame = null;
      Object.keys(NAF.entities.entities).forEach(key => {
        let frame = NAF.entities.entities[key];
        if (frame.className === name) {
          mediaFrame = frame;
        }
      });
      if (mediaFrame) {
        NAF.utils.getNetworkedEntity(mediaFrame).then(async networkedEl => {
          if (!NAF.utils.isMine(networkedEl)) {
            NAF.utils.takeOwnership(networkedEl);
          }
          resolve(mediaFrame);
        });
      } else {
        resolve(mediaFrame);
      }
    });
  }

  async removeFromMediaFrame(actionData) {
    let mediaFrame = await this.findMediaFrameByName(actionData.action.mediaFrame);
    await this.removeOldMediaFrameEntity(mediaFrame);
  }

  async url(actionData) {
    if (actionData.action.mode) {
      switch (actionData.action.mode) {
        case "change":
          window.location.href = actionData.action.url;
          break;
        case "rest_get":
          axios.get(actionData.action.url, actionData.action.config).then(resp => {
            console.log(resp.data);
          }).catch(reason => {
            console.error(reason);
          });
          break;
        case "rest_post":
          axios.post(actionData.action.url, actionData.action.data, actionData.action.config).then(resp => {
            console.log(resp.data);
          }).catch(reason => {
            console.error(reason);
          });
          break;
        default:
          window.open(actionData.action.url, "_blank");
      }
    } else {
      //default new_page
      window.open(actionData.action.url, "_blank");
    }
  }

  convertToEntry(id, data) {
    let actionData = this.actions[id];
    let entry;
    if (data && (data.camera || data.shareScreen)) {
      entry = data;
    } else {
      actionData.action.url = actionData.action.url || "";
      if (actionData.action.url.indexOf("$trigger.url") !== -1) {
        actionData.action.url = actionData.action.url.replace("$trigger.url", data.url);
      }
      entry = {
        url: actionData.action.url,
        contentOrigin: ObjectContentOrigins.URL
      };
    }
    return entry;
  }

  async triggerAction(id, data) {
    let actionData = this.actions[id];
    if (actionData) {
      if (actionData.action.type === "animation") {
        actionData.callback();
        networkService.sendMessage("animation_play", { id });
      } else if (actionData.action.type === "spawn_attach") {
        let entry = this.convertToEntry(id, data);
        this.spawnAttach(actionData, entry);
      } else if (actionData.action.type === "remove_from_media_frame") {
        this.removeFromMediaFrame(actionData);
      } else if (actionData.action.type === "spawn") {
        let entry = this.convertToEntry(id, data);
        this.handleEntry(entry);
      } else if (actionData.action.type === "url") {
        this.url(actionData);
      } else if (actionData.action.type === "room") {
        //deprecated
        if (actionData.action.entry_mode) {
          console.log("entry mode set to ", actionData.action.entry_mode);
          roomController.setEntryMode(actionData.action.entry_mode);
        }
      }
    }
  }
}

export const customActionRegister = new CustomActionRegister();