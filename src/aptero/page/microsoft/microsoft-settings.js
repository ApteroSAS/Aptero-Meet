import React from "react";
import ReactDOM from "react-dom";
import {WrappedIntlProvider} from "../../../react-components/wrapped-intl-provider";
import registerTelemetry from "./../../../telemetry";
import Store from "./../../../storage/store";
import "./../../../utils/theme";
import {SettingsPage} from "../../react-components/settings/SettingsPage";
import {AuthContextProvider} from "../../../react-components/auth/AuthContext";
import {ThemeProvider} from "../../../react-components/styles/theme";
import {
    getAuthEvents, getCredential,
    LOGGED_BASIC_INFO,
    microsoftLoginService, TOKEN_RECEIVED
} from "../../service/MicrosoftIntegration/MicrosoftLoginService";


import * as microsoftTeams from "@microsoft/teams-js";
import {AccountAuth} from "../../react-components/msft/AccountAuth";
import {Button, Input} from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1
import {roomService} from "../../service/MicrosoftIntegration/RoomService";
import {FormattedMessage} from "react-intl";
import {CHANGE_SETTINGS_URL, getMSEvents} from "../../service/MicrosoftIntegration/MsTeams";

registerTelemetry("/microsoft-settings", "microsoft-settings");
import { Provider, teamsTheme } from '@fluentui/react-northstar'


const store = new Store();
window.APP = {store};
microsoftLoginService.passiveLogin();

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
        logged: null,
        suggestedDisplayName: "Virtual Meeting",
    }
    removeListeners = () => {
    };

    componentDidMount() {
        microsoftTeams.settings.setValidityState(false);
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
                new URL(msg.url);//test url valide
                this.setState({url: msg.url})
            } catch (ex) {
                console.error(ex)
            }
        }
        getMSEvents().on(CHANGE_SETTINGS_URL, callbackUrl);

        const onLogged = () => {
            console.log("onLogged")
            this.setState({logged: true});
        }

        getAuthEvents().on(LOGGED_BASIC_INFO, onLogged);
        getAuthEvents().on(TOKEN_RECEIVED, onLogged);

        this.removeListeners = () => {
            getMSEvents().off(CHANGE_SETTINGS_URL, callbackUrl);
            getAuthEvents().off(LOGGED_BASIC_INFO, onLogged);
            getAuthEvents().off(TOKEN_RECEIVED, onLogged);
        }
        const cred = getCredential();
        cred.getUserInfo().then(data => {
            //{"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
            console.log("teams user info : ", data);
            if (data.preferredUserName) {
                this.setState({logged: data});
            }
        })
        /**
         * When the user clicks "Save", save the url for your configured tab.
         * This allows for the addition of query string parameters based on
         * the settings selected by the user.
         */
        microsoftTeams.settings.registerOnSaveHandler(async (saveEvent) => {
            let config = {...this.state};
            const roomurl = new URL(config.url);
            const teamsParams = btoa(encodeURIComponent(JSON.stringify(await getCredential().getUserInfo())))
            roomurl.searchParams.append("msteams", teamsParams);
            let data = roomService.parseUrl(roomurl.toString());
            let token = await roomService.getEmbedToken(data.roomSID, data.origin);
            roomurl.searchParams.append("embed_token", token);
            config.url = roomurl.toString();
            microsoftTeams.settings.setSettings({
                suggestedDisplayName: this.state.suggestedDisplayName,
                entityId: "sceneConfig",
                contentUrl: config.url,
                websiteUrl: config.url,
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

        let roomUrl = this.state.url
        try {
            roomUrl = new URL(this.state.url).origin + new URL(this.state.url).pathname;
        } catch (e) {
            //ignore error
        }
        return (
            <Provider theme={teamsTheme}>
            <WrappedIntlProvider>
                <AuthContextProvider store={store}>
                    <ThemeProvider store={store}>
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
                                        microsoftTeams.settings.setValidityState(false);
                                        this.setState({url: ""})
                                    }}><FormattedMessage id="microsoft.settings.change-scene"
                                                         defaultMessage="Change Scene"/></Button>
                                </>
                                }
                                {!this.state.url &&
                                    <SettingsPage basicInfo={this.state.logged}/>
                                }
                            </>}
                            <span onClick={() => {
                                window.location.reload()
                            }} id="version" style={{
                                "margin": 0,
                                "top": 0,
                                "left": "auto",
                                "right": "4px",
                                "bottom": "2px",
                                "fontSize": "0.7em",
                                "position": "fixed"
                            }}>{process.env.BUILD_VERSION}</span>
                        </div>
                    </ThemeProvider>
                </AuthContextProvider>
            </WrappedIntlProvider>
            </Provider>
        );
    }
}

ReactDOM.render(<TabConfig/>, document.getElementById("home-root"));
