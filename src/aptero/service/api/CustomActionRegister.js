import { networkService } from "../NetworkService";
import { spawnMediaInfrontOfPlayer } from "../../util/Media";
import { ObjectContentOrigins } from "../../../object-types";
import { ActionAnimationController } from "./ActionAnimationController";
import { roomController } from "./RoomController";

export class CustomActionRegister {
  actions = {};

  constructor(){
    this.actionAnimationController = new ActionAnimationController();
  }

  async start() {
    this.actionAnimationController.init();
  }

  setup(htmlElement,action,actionid){
    if (action.type === "animation") {
      this.actionAnimationController.setup(htmlElement,action,actionid);
    }
    this.actions[actionid] = { action: action };
  }

  triggerAction(id) {
    let actionData = this.actions[id];
    if (actionData) {
      if (actionData.action.type === "animation") {
        actionData.callback();
        networkService.sendMessage("animation_play", { id })
      } else if (actionData.action.type === "spawn") {
        spawnMediaInfrontOfPlayer(actionData.action.url, ObjectContentOrigins.URL, null);
      } else if (actionData.action.type === "url") {
        window.open(actionData.action.url, "_blank");
      } else if (actionData.action.type === "room") {
        if(actionData.action.entry_mode) {
          console.log("entry mode set to ",actionData.action.entry_mode);
          roomController.setEntryMode(actionData.action.entry_mode)
        }
      }
    }
  }
}

export const customActionRegister = new CustomActionRegister();