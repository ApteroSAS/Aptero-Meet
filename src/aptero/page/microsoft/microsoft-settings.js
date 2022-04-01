import React from "react";
import ReactDOM from "react-dom";
import {WrappedIntlProvider} from "../../../react-components/wrapped-intl-provider";
import registerTelemetry from "./../../../telemetry";
import Store from "./../../../storage/store";
import "./../../../utils/theme";
import {SettingsPage} from "../../react-components/settings/SettingsPage";
import {AuthContextProvider} from "../../../react-components/auth/AuthContext";
import {ThemeProvider} from "../../../react-components/styles/theme";
import {microsoftLoginService} from "../../service/MicrosoftIntegration/MicrosoftLoginService";


import * as microsoftTeams from "@microsoft/teams-js";
import {AccountAuth} from "../../react-components/msft/AccountAuth";
import {Button, Input} from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1
import {roomService} from "../../service/MicrosoftIntegration/RoomService";
import {
    CHANGE_SETTINGS_URL,
    meetVsTeamsBridge
} from "../../service/MicrosoftIntegration/MeetVsTeamsBridge";
import {getDefaultOrigin} from "../../service/MicrosoftIntegration/Origin";
import {getAuthEvents, TOKEN_RECEIVED, LOGGED_BASIC_INFO} from "../../service/MicrosoftIntegration/Auth";
import {FormattedMessage} from "react-intl";

registerTelemetry("/microsoft-settings", "microsoft-settings");


const store = new Store();
window.APP = {store};

/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */

class TabConfig extends React.Component {
    state = {
        //url:"https://meet.aptero.co/3NKS9NY?embed_token=ae766e3d6bb6394d2aa38f69d5f1aad9&adapter=none"
        //url:"https://meet.aptero.co/3S7yY8X/kpmg-eqho?embed_token=ed66cbb7892901957af4a85bd30f2cd1"
        //url:"https://fa02-2001-861-36c3-d030-3101-4f25-21aa-393e.ngrok.io/hub.html?hub_id=fTj63Hg&msteams=true&embed_token=846d38e7d0bc3c49716f5f5cb2577ff8"
        //url:"https://alphahub.aptero.co/fTj63Hg",
        url: "",
        size: {width: "100%", height: "2000px"},
        logged: false,
        suggestedDisplayName: "Virtual Meeting",
    }
    removeListeners = () => {
    };

    componentDidMount() {
        document.getElementById("version").innerHTML = process.env.BUILD_VERSION;
        microsoftTeams.settings.getSettings((instanceSettings) => {
            if (instanceSettings.websiteUrl) {
                try {
                    new URL(instanceSettings.websiteUrl);//test url valide
                    this.setState({url: instanceSettings.websiteUrl})
                } catch (ex) {
                    console.error(ex)
                }
            }
        });
        const callbackUrl = (msg) => {
            try {
                new URL(msg.data.url);//test url valide
                this.setState({url: msg.data.url})
            } catch (ex) {
                console.error(ex)
            }
        }
        meetVsTeamsBridge.eventListener.on(CHANGE_SETTINGS_URL, callbackUrl);

        const onLogged = () => {
            this.setState({logged: true});
        }

        getAuthEvents().on(LOGGED_BASIC_INFO, onLogged);
        getAuthEvents().on(TOKEN_RECEIVED, onLogged);

        this.removeListeners = () => {
            meetVsTeamsBridge.eventListener.off(CHANGE_SETTINGS_URL, callbackUrl);
            getAuthEvents().off(LOGGED_BASIC_INFO, onLogged);
            getAuthEvents().off(TOKEN_RECEIVED, onLogged);
        }
    }

    componentWillUnmount() {
        this.removeListeners();
    }


    render() {
        // Initialize the Microsoft Teams SDK
        microsoftTeams.initialize();

        /**
         * When the user clicks "Save", save the url for your configured tab.
         * This allows for the addition of query string parameters based on
         * the settings selected by the user.
         */
        microsoftTeams.settings.registerOnSaveHandler(async (saveEvent) => {
            let config = {...this.state};
            const roomurl = new URL(config.url);
            roomurl.searchParams.append("msteams", "true");
            let data = roomService.parseUrl(roomurl.toString());
            let token = await roomService.getEmbedToken(data.roomSID, data.origin);
            roomurl.searchParams.append("embed_token", token);
            config.url = roomurl.toString();
            const atobStr = btoa(encodeURIComponent(JSON.stringify(config)));
            const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
            const url = new URL(baseUrl + "/index.html#/scene");
            url.searchParams.append("data", atobStr);
            microsoftTeams.settings.setSettings({
                suggestedDisplayName: this.state.suggestedDisplayName,
                entityId: "sceneConfig",
                contentUrl: url.toString(),
                websiteUrl: config.url,
            });
            saveEvent.notifySuccess();
        });

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
        let frameUrl = new URL(getDefaultOrigin() + "/microsoft-settings.html");
        try {
            frameUrl = new URL((new URL(this.state.url).origin) + "/microsoft-settings.html");
        } catch (e) {
            //ignore error
        }
        frameUrl.searchParams.set("msteams", "true");
        frameUrl.searchParams.set("verion", process.env.BUILD_VERSION);//add a parameters to refresh cache on new version

        let roomUrl = this.state.url
        try {
            roomUrl = new URL(this.state.url).origin + new URL(this.state.url).pathname;
        } catch (e) {
            //ignore error
        }
        return (
            <WrappedIntlProvider>
                <ThemeProvider store={store}>
                    <AuthContextProvider store={store}>
                        <div style={{margin: "8px"}}>
                            <h2><FormattedMessage id="microsoft.settings.identity" defaultMessage="Identity"/></h2>
                            <AccountAuth/>
                            {this.state.logged && <>
                                <h2><FormattedMessage id="microsoft.settings.room" defaultMessage="Room"/></h2>
                                {this.state.url && <>
                                    <Input
                                        label={<FormattedMessage id="microsoft.settings.room-display-name"
                                                                 defaultMessage="Room Display Name"/>}
                                        fluid
                                        value={this.state.suggestedDisplayName}
                                        onChange={(value) => {
                                            this.setState({suggestedDisplayName: value.target.value})
                                        }}
                                    />
                                    <Input
                                        label={<FormattedMessage id="microsoft.settings.selected-room"
                                                                 defaultMessage="Selected Room"/>}
                                        fluid
                                        value={roomUrl}
                                        onChange={(value) => {
                                            this.setState({url: value.target.value})
                                        }}
                                    />
                                    <Button fluid onClick={() => {
                                        this.setState({url: ""})
                                    }}><FormattedMessage id="microsoft.settings.change-scene"
                                                         defaultMessage="Change Scene"/></Button>
                                </>
                                }
                                {!this.state.url &&
                                    <SettingsPage/>
                                }
                            </>}
                            <span onClick={()=>{window.location.reload()}} id="version" style={{
                                "margin": 0,
                                "top": 0,
                                "left": "auto",
                                "right": "4px",
                                "bottom": "2px",
                                "fontSize": "0.7em",
                                "position": "fixed"
                            }}>{process.env.BUILD_VERSION}</span>
                        </div>
                    </AuthContextProvider>
                </ThemeProvider>
            </WrappedIntlProvider>
        );
    }
}

ReactDOM.render(<TabConfig/>, document.getElementById("home-root"));
microsoftLoginService.passiveLogin();
