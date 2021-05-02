import axios from "axios";
import { propertiesService } from "../properties/propertiesService";
import { addEntryModeIfNotExist } from "../util/EntryMode";
import configs from "../../utils/configs"

export class RoomParameters {
    fetch=false;

    async getParameters(roomSID) {
        return await new Promise((resolve, reject) => {
            axios.get(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/room/" + roomSID).then(resp => {
                resolve(resp.data);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    customPermission() {
        return ["change_screen", "show_spawn_and_move_media", "share_screen"];
    }

    async applyPermissionAsync(permission, admin) {
        permission["show_spawn_and_move_media"] = true;//default value
        let roomConfig = await this.getParameters(permission.hub_id);
        this.getAndApplyRoomParameters();//also update preferences
        if (roomConfig) {
            if (roomConfig.permission) {
                permission = { ...permission, ...roomConfig.permission };
            }
            if (permission["change_video"]) {
                permission["pin_objects"] = true;
                permission["spawn_camera"] = true;
            }
        }

        if (permission["spawn_and_move_media"] === false && !admin) {
            //if we do not have right to move media we do not show button for it
            permission["show_spawn_and_move_media"] = false;
            permission["spawn_camera"] = false;
            permission["pin_objects"] = false;
            permission["change_screen"] = false;
            permission["share_screen"] = false;
        }
        if(admin){
          //admin have any right anyways
          permission["show_spawn_and_move_media"] = true;
          permission["spawn_camera"] = true;
          permission["pin_objects"] = true;
          permission["change_screen"] = true;
          permission["share_screen"] = true;
        }
        return permission;
    }

    async applyDefaultAudioSettingsSystem(audioSettingsSystem) {
        //let audioSettings = AFRAME.scenes[0].systems["hubs-systems"].audioSettingsSystem.audioSettings;
        await this.getAndApplyRoomParameters();//ensure parameters are retrieved
        let audioSettings = audioSettingsSystem.audioSettings;
        if (audioSettings) {
            console.log("applyDefaultAudioSettingsSystem");
            Object.keys(audioSettings).forEach(key => {
                audioSettings[key] = window.getPreferences(key) || audioSettings[key];
            });
            //special cases
            audioSettings.avatarDistanceModel = window.getPreferences("distanceModel") || audioSettings.avatarDistanceModel;
            audioSettings.avatarRolloffFactor = window.getPreferences("rolloffFactor") || audioSettings.avatarRolloffFactor;
            audioSettings.avatarRefDistance = window.getPreferences("refDistance") || audioSettings.avatarRefDistance;
            audioSettings.avatarMaxDistance = window.getPreferences("maxDistance") || audioSettings.avatarMaxDistance;
        }
    }

    async getAndApplyRoomParameters() {
        if(!this.fetch) {
            const qs = new URLSearchParams(window.location.search);
            const roomSID = qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0];
            window.APP.override = { preferences: {} };
            let roomConfig = await this.getParameters(roomSID);
            if (roomConfig) {
                if (roomConfig.preferences) {
                    Object.keys(roomConfig.preferences).forEach(key => {
                        window.APP.store.state.preferences[key] = roomConfig.preferences[key];
                    });
                }
                if (roomConfig.preferencesOverride) {
                    Object.keys(roomConfig.preferencesOverride).forEach(key => {
                        window.APP.override.preferences[key] = roomConfig.preferencesOverride[key];
                    });
                }
                if (roomConfig.entryMode) {
                    addEntryModeIfNotExist(roomConfig.entryMode);
                }
                if (roomConfig.AppConfigOverride) {
                    Object.keys(roomConfig.AppConfigOverride).forEach(key => {
                        configs.APP_CONFIG[key] = roomConfig.AppConfigOverride[key];
                    });
                }
            }
            this.fetch = true;
        }
    }
    
}

export const roomParameters = new RoomParameters();