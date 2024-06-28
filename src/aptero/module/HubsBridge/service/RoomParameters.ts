import axios from "axios";
import {propertiesService} from "../../properties/propertiesService";
import configs from "../../../../utils/configs";
import {addEntryModeIfNotExist} from "../utils/EntryMode";
import {AudioSettings, Permission, RoomParametersData} from "./RoomParametersInterface";

interface WindowExtended extends Window {
  APP: any;
  theme: any;
}

declare const window: WindowExtended;

export class RoomParameters {
  fetch = false;
  roomConfig: RoomParametersData;
  currentTheme: string;

  async getParameters(roomSID):Promise<RoomParametersData> {
    //console.log(propertiesService);
    return await new Promise((resolve) => {
      axios
        .get(propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/dbapi/room/" + roomSID)
        .then(resp => {
          resolve(resp.data);
        })
        .catch(reason => {
          resolve({});
          console.error(reason);
        });
    });
  }


  customPermission() {
    return ["change_screen", "show_spawn_and_move_media", "share_screen"];
  }

  canMove(entity) {
    if (entity.getAttribute("forbidden-to-move")) {
      return false;
    }
    /*const isPinned = entity.components.pinnable && entity.components.pinnable.data.pinned;
        if(isPinned && window.APP.hubChannel.can("spawn_and_move_media") && window.APP.hubChannel.can("pin_objects")){
            return true;
        }*/
    return null; //default
  }

  async applyPermissionAsync(permission:Permission, admin:boolean):Promise<Permission> {
    permission["show_spawn_and_move_media"] = true; //default value
    let roomConfig = await this.getParameters(permission.hub_id);
    await this.applyRoomParameters(); //also update preferences
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
    if (admin) {
      //admin have any right anyways
      permission["show_spawn_and_move_media"] = true;
      permission["spawn_camera"] = true;
      permission["pin_objects"] = true;
      permission["change_screen"] = true;
      permission["share_screen"] = true;
    }
    return permission;
  }

  async applyDefaultAudioSettingsSystem(audioSettingsSystem:{audioSettings:AudioSettings}):Promise<void> {
    //let audioSettings = AFRAME.scenes[0].systems["hubs-systems"].audioSettingsSystem.audioSettings;
    let roomConfig = await this.getRoomParameters(); //ensure parameters are retrieved
    let audioSettings = audioSettingsSystem.audioSettings;
    if (audioSettings && roomConfig && roomConfig.preferencesOverride) {
      console.log("applyDefaultAudioSettingsSystem");
      Object.keys(audioSettings).forEach(key => {
        audioSettings[key] = roomConfig.preferencesOverride[key] || audioSettings[key];
      });
      //special cases
      audioSettings.avatarDistanceModel =
        roomConfig.preferencesOverride["distanceModel"] || audioSettings.avatarDistanceModel;
      audioSettings.avatarRolloffFactor =
        roomConfig.preferencesOverride["rolloffFactor"] || audioSettings.avatarRolloffFactor;
      audioSettings.avatarRefDistance =
        roomConfig.preferencesOverride["refDistance"] || audioSettings.avatarRefDistance;
      audioSettings.avatarMaxDistance =
        roomConfig.preferencesOverride["maxDistance"] || audioSettings.avatarMaxDistance;
    }
  }

  async getRoomParameters():Promise<RoomParametersData> {
    if (!this.fetch) {
      const qs = new URLSearchParams(window.location.search);
      const roomSID = qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0];
      this.roomConfig = await this.getParameters(roomSID);
      this.fetch = true;
    }
    return this.roomConfig;
  }

  async applyRoomParameters(): Promise<RoomParametersData> {
    let roomConfig = await this.getRoomParameters();
    window.APP.override = { preferences: {} };
    if (roomConfig) {
      if (roomConfig.preferences) {
        for (const key of Object.keys(roomConfig.preferences)) {
          window.APP.store.state.preferences[key] = roomConfig.preferences[key];
        }
      }
      if (roomConfig.preferencesOverride) {
        for (const key of Object.keys(roomConfig.preferencesOverride)) {
          window.APP.override.preferences[key] = roomConfig.preferencesOverride[key];
        }
      }
      if (roomConfig.entryMode) {
        addEntryModeIfNotExist(roomConfig.entryMode);
      }
      if (roomConfig.AppConfigOverride) {
        for (const key of Object.keys(roomConfig.AppConfigOverride)) {
          configs.APP_CONFIG[key] = roomConfig.AppConfigOverride[key];
        }
        const defaultTheme = roomConfig.AppConfigOverride.defaultTheme;
        if (defaultTheme){
          //store.state?.preferences?.theme
          console.log("defaultTheme", defaultTheme);
          this.currentTheme = defaultTheme;
          //window.theme.requestChangeTheme(defaultTheme); //note this will bug since react is not initialized at this point
          /*window.APP.store.update({ // this will change the user preferences
            preferences: {
              theme: defaultTheme
            }
          });*/
        }
      }
    }
    return roomConfig;
  }
}

export const roomParameters = new RoomParameters();
