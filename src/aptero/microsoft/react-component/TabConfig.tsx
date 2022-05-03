import * as React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import { Loader } from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1
import { roomService } from "../service/RoomService";
import { FormattedMessage } from "react-intl";
import { CHANGE_SETTINGS_URL, getMSEvents } from "../service/MsTeams";
import { LoginButton } from "./LoginButton";
import { RoomSection } from "./RoomSection";

import {
  getAuthEvents,
  AUTH_SERVICE_INITIALIZE
} from "../service/AuthEvent";
import { getCredential } from "../service/TeamsLoginService";

declare const window;

/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */
export class TabConfig extends React.Component {
  state = {
    //url:"https://meet.aptero.co/3NKS9NY?embed_token=ae766e3d6bb6394d2aa38f69d5f1aad9&adapter=none"
    //url:"https://meet.aptero.co/3S7yY8X/kpmg-eqho?embed_token=ed66cbb7892901957af4a85bd30f2cd1"
    //url:"https://fa02-2001-861-36c3-d030-3101-4f25-21aa-393e.ngrok.io/hub.html?hub_id=fTj63Hg&msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8"
    //url:"https://alphahub.aptero.co/fTj63Hg",
    url: "",
    size: { width: "100%", height: "2000px" },
    initialized: null,
    suggestedDisplayName: "Virtual Meeting"
  };
  removeListeners = () => {
  };

  componentDidMount() {
    microsoftTeams.settings.setValidityState(false);
    document.getElementById("version").innerHTML = process.env.BUILD_VERSION;
    microsoftTeams.settings.getSettings((instanceSettings) => {
      if (instanceSettings.websiteUrl) {
        try {
          new URL(instanceSettings.websiteUrl);//test url valide
          this.setState({ url: instanceSettings.websiteUrl });
        } catch (ex) {
          console.error(ex);
        }
      }
    });
    const callbackUrl = (msg) => {
      try {
        new URL(msg.url);//test url valide
        this.setState({ url: msg.url });
      } catch (ex) {
        console.error(ex);
      }
    };
    getMSEvents().on(CHANGE_SETTINGS_URL, callbackUrl);

    this.removeListeners = () => {
      getMSEvents().off(CHANGE_SETTINGS_URL, callbackUrl);
    };
    const onInitialized = () => {
      console.log("onInitialized");
      getAuthEvents().off(AUTH_SERVICE_INITIALIZE, onInitialized);
      this.setState({ initialized: true });
    };

    getAuthEvents().on(AUTH_SERVICE_INITIALIZE, onInitialized);

    /**
     * When the user clicks "Save", save the url for your configured tab.
     * This allows for the addition of query string parameters based on
     * the settings selected by the user.
     */
    microsoftTeams.settings.registerOnSaveHandler(async (saveEvent) => {
      let config = { ...this.state };
      const roomurl = new URL(config.url);
      const teamsParams = btoa(encodeURIComponent(JSON.stringify(await getCredential().getUserInfo())));
      roomurl.searchParams.append("msteams", teamsParams);
      let data = roomService.parseUrl(roomurl.toString());
      let token = await roomService.getEmbedToken(data.roomSID, data.origin);
      roomurl.searchParams.append("embed_token", token);
      config.url = roomurl.toString();
      microsoftTeams.settings.setSettings({
        suggestedDisplayName: this.state.suggestedDisplayName,
        entityId: "sceneConfig",
        contentUrl: config.url,
        websiteUrl: config.url
      });
      saveEvent.notifySuccess();
    });
  }

  componentWillUnmount() {
    this.removeListeners();
  }


  render() {
    /**
     * After verifying that the settings for your tab are correctly
     * filled in by the user you need to set the state of the dialog
     * to be valid.  This will enable the save button in the configuration
     * dialog.
     */
    if (this.state.url) {
      //form valisation
      try {
        new URL(this.state.url);
        microsoftTeams.settings.setValidityState(true);
      } catch (e) {
        //ignore error
      }
    }

    let roomUrl = this.state.url;
    try {
      roomUrl = new URL(this.state.url).origin + new URL(this.state.url).pathname;
    } catch (e) {
      //ignore error
    }

    return (
      <div style={{ margin: "8px" }}>
        {!this.state.initialized && <Loader/>}
        {this.state.initialized && <>
          <h2><FormattedMessage id="microsoft.settings.identity" defaultMessage="Identity"/>
          </h2>
          <LoginButton/>
          <RoomSection roomUrl={roomUrl}
                       suggestedDisplayName={this.state.suggestedDisplayName}
                       onChangeRoomUrl={text => {
                         if (!text) {
                           microsoftTeams.settings.setValidityState(false);
                         }
                         this.setState({ url: text });
                       }}
                       onChangeSuggestedDisplayName={text => {
                         this.setState({ suggestedDisplayName: text });
                       }}
          />
        </>}
      </div>
    );
  }
}