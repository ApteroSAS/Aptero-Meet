import React, {useState, useEffect} from 'react';
import {Loader} from '@fluentui/react-northstar';
import {RoomSection} from '../components/RoomSection';
import {CHANGE_SETTINGS_URL, MSTEAMS_QUERY_PARAM} from '@aptero/axolotis-module-teams';
import {tryMSMatchTheme} from '../components/MSThemeMatcher';
import {msTeamsAPI, roomService} from '../../../axolotis/modules/basic/ImportHelper';
import {SignIn} from '../components/SignIn';

let finalUrl = '';//global

export const TabConfig = () => {
    const [url, setUrl] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [suggestedDisplayName, setSuggestedDisplayName] = useState('Virtual Meeting');
    const [removeListeners, setRemoveListeners] = useState<({cb:() => void})>({cb:() => {}});

    useEffect(() => {
        const initAsync = async () => {
            const msTeamsAPI1 = await msTeamsAPI();
            await tryMSMatchTheme();
            const loginService = msTeamsAPI1.getLoginService();
            await loginService.onReady();
            try {
                await msTeamsAPI1.getTeamsApp().app.initialize();
            } catch (e) {
                console.log('microsoftTeams.initialize failed (probably not in teams so we skip it)', e);
            }
            msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
            const instanceSettings = await msTeamsAPI1.getTeamsApp().pages.getConfig();
            if (instanceSettings.websiteUrl) {
                try {
                    new URL(instanceSettings.websiteUrl);//test url valide
                    setUrl(instanceSettings.websiteUrl);
                } catch (ex) {
                    console.error(ex);
                }
            }

            const callbackUrl = async (msg) => {
                try {
                    let url = msg.url;
                    setUrl(url);
                    const roomurl = new URL(url);
                    const teamsParams = btoa(encodeURIComponent(JSON.stringify(await loginService.getTeamsLoginService().getUserInfo())));
                    roomurl.searchParams.append(MSTEAMS_QUERY_PARAM, teamsParams);
                    let data = (await roomService()).parseUrl(roomurl.toString());
                    let token = await (await roomService()).getEmbedToken(data.roomSID, data.origin);
                    roomurl.searchParams.append('embed_token', token);
                    finalUrl = roomurl.toString();
                    msTeamsAPI1.getTeamsApp().pages.config.setValidityState(true);
                } catch (ex) {
                    msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
                    console.error(ex);
                }
            };

            msTeamsAPI1.getMSEvents().on(CHANGE_SETTINGS_URL, callbackUrl);
            removeListeners.cb();
            setRemoveListeners({cb:() => {
                msTeamsAPI1.getMSEvents().off(CHANGE_SETTINGS_URL, callbackUrl);
            }});
            /**
             * When the user clicks "Save", save the url for your configured tab.
             * This allows for the addition of query string parameters based on
             * the settings selected by the user.
             */
            const pages = msTeamsAPI1.getTeamsApp().pages;
            pages.config.registerOnSaveHandler((saveEvent) => { /*dont use async here*/
                console.log(finalUrl);
                new URL(finalUrl);//test url valide
                if(!finalUrl){
                    throw new Error('finalUrl is empty');
                }
                pages.config.setConfig({
                    suggestedDisplayName: suggestedDisplayName,
                    entityId: "sceneConfig",
                    contentUrl: finalUrl,
                    websiteUrl: finalUrl
                }).then(() => {
                    saveEvent.notifySuccess();
                }).catch((error) => {
                    console.error(error);
                    saveEvent.notifyFailure();
                });
            });
            setInitialized(true);
        };

        initAsync();

        return () => {
            removeListeners.cb();
        };
    }, []);

    return (
        <div style={{margin: '8px'}}>
            {!initialized && <Loader/>}
            {initialized && (<>
                    <SignIn/>
                    <RoomSection
                        roomUrl={url}
                        suggestedDisplayName={suggestedDisplayName}
                        onChangeRoomUrl={async (newUrl) => {
                            console.log(newUrl);
                            const msTeamsAPI1 = await msTeamsAPI();
                            if (!newUrl) {
                                msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
                            } else {
                                await msTeamsAPI1.changeUrlSettings(newUrl);
                            }
                        }}
                        onChangeSuggestedDisplayName={(text) => setSuggestedDisplayName(text)}
                    /></>
            )}
        </div>
    );
};
