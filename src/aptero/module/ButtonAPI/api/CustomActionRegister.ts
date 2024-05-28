import {roomApi} from "../../FrontEndAPI/RoomApi";
import {Action} from "./Action";
import axios from "axios";

export class CustomActionRegister {
    private actions: Record<string, { action: Action,htmlElement?: any }> = {};
    public triggers: Record<string, any> = {};

    async triggerAction(id, data) {
        try {
            let actionData = this.actions[id];
            if (actionData) {
                const actionDef = actionData.action;
                if (actionDef.type === "animation") {
                    // Remove ALL text before "ApteroANIM_" from apteroAnimation
                    let apteroAnimation = id.replace(/.*ApteroANIM_/, "");
                    // Also, remove everything after the last underscore (including the underscore)
                    apteroAnimation = apteroAnimation.replace(/_[^_]*$/, "");

                    roomApi.triggerAnimation(apteroAnimation, actionDef);
                } else if (actionDef.type === "spawn_attach") {
                    await roomApi.spawnAttach(actionDef.mediaFrame, actionDef.url, {attribute: actionDef.attributes});
                } else if (actionDef.type === "remove_from_media_frame") {
                    await roomApi.removeFromMediaFrame(actionDef.mediaFrame);
                } else if (actionDef.type === "spawn") {
                    roomApi.spawn(actionDef.url, {});
                } else if (actionDef.type === "url") {
                    await this.url(actionDef);
                } else if (actionDef.type === "sidebar_iframe") {
                    this.openSidebarIframe(actionDef);
                } else if (actionDef.type === "ai_action") {
                    await roomApi.notifyUserActionToAi(actionDef.description, actionDef.triggerReaction, {
                        id: id.split("_")[1],
                        position: actionData.htmlElement.object3D.getWorldPosition(new THREE.Vector3())
                    });
                }
            }
        } catch (e) {
            //an action should never crash the app just log the error and move one
            console.error(e);
        }
    }

    public setup(htmlElement:any, action: Action, actionid: string) {
        this.actions[actionid] = {action: action,htmlElement: htmlElement};
    }

    public actionExist(actionid: string) {
        return !!this.actions[actionid];
    }

    private openSidebarIframe(actionData: Action) {
        AFRAME.scenes[0].emit("action_toggle_custom_sidebar");
        setTimeout(() => {
            AFRAME.scenes[0].emit("action_toggle_custom_sidebar_info", actionData)
        }, 10);
    }

    private async url(actionData: Action) {
        if (actionData.type === "url") {
            if (actionData.mode) {
                switch (actionData.mode) {
                    case "change":
                        window.location.href = actionData.url;
                        break;
                    case "rest_get":
                        axios.get(actionData.url, actionData.config).then(resp => {
                            console.log(resp.data);
                        }).catch(reason => {
                            console.error(reason);
                        });
                        break;
                    case "rest_post":
                        axios.post(actionData.url, actionData.data, actionData.config).then(resp => {
                            console.log(resp.data);
                        }).catch(reason => {
                            console.error(reason);
                        });
                        break;
                    default:
                        window.open(actionData.url, "_blank");
                }
            } else {
                //default new_page
                window.open(actionData.url, "_blank");
            }
        }
    }

}

export const customActionRegister = new CustomActionRegister();
