import { networkService } from "../NetworkService";
import { spawnMediaInfrontOfPlayer } from "../../util/Media";
import { ObjectContentOrigins } from "../../../object-types";
import { ActionAnimationController } from "./ActionAnimationController";
import { roomController } from "./RoomController";
import { mediaViewEventEmitter } from "../../../components/media-views";

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
          let pool = ()=>{
            if(!(entity.object3D && entity.getObject3D("mesh"))){
              setTimeout(pool,500);
            }else{
              resolve(entity);
              entity.sceneEl.addEventListener("action_end_video_sharing", () => {
                if(entity.parentNode) {
                  entity.parentNode.removeChild(entity);
                }
              },{once:true});
            }
          };
          setTimeout(pool,500);
        });
      } else {
        resolve(spawnMediaInfrontOfPlayer(entry.url, entry.contentOrigin, null));
      }
    })
  }

  async triggerAction(id, data) {
    let actionData = this.actions[id];
    if (actionData) {
      if (actionData.action.type === "animation") {
        actionData.callback();
        networkService.sendMessage("animation_play", { id });
      } else if (actionData.action.type === "spawn_attach") {

        let entity = await new Promise(async (resolve, reject) => {
          actionData.action.url = actionData.action.url || "";
          if (actionData.action.url.indexOf("$trigger.url") !== -1) {
            actionData.action.url = actionData.action.url.replace("$trigger.url", data.url);
            resolve(spawnMediaInfrontOfPlayer(actionData.action.url, ObjectContentOrigins.URL, null));
          } else {
            resolve(await this.handleEntry(data));
          }
        });

        let mediaFrame = null;
        Object.keys(NAF.entities.entities).forEach(key => {
          let frame = NAF.entities.entities[key];
          if (frame.className === actionData.action.mediaFrame) {
            mediaFrame = frame;
          }
        });
        if (mediaFrame && mediaFrame.components["media-frame"]) {
          setTimeout(() => {
            mediaFrame.components["media-frame"].capture(entity);
          }, 0);
        } else {
          console.error("invalid media frame target");
        }
      } else if (actionData.action.type === "spawn") {
        spawnMediaInfrontOfPlayer(actionData.action.url, ObjectContentOrigins.URL, null);
      } else if (actionData.action.type === "url") {
        window.open(actionData.action.url, "_blank");
      } else if (actionData.action.type === "room") {
        if (actionData.action.entry_mode) {
          console.log("entry mode set to ", actionData.action.entry_mode);
          roomController.setEntryMode(actionData.action.entry_mode);
        }
      }
    }
  }
}

export const customActionRegister = new CustomActionRegister();