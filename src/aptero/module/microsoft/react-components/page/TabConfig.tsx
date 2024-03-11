import React, { useState, useEffect } from 'react';
import { Loader } from '@fluentui/react-northstar';
import { RoomSection } from '../components/RoomSection';
import { CHANGE_SETTINGS_URL, MSTEAMS_QUERY_PARAM } from '@aptero/axolotis-module-teams';
import { tryMSMatchTheme } from '../components/MSThemeMatcher';
import { msTeamsAPI, roomService } from '../../../axolotis/modules/basic/ImportHelper';
import { SignIn } from '../components/SignIn';

export const TabConfig = () => {
  const [url, setUrl] = useState('');
  const [initialized, setInitialized] = useState(null);
  const [suggestedDisplayName, setSuggestedDisplayName] = useState('Virtual Meeting');
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    (async () => {
      let msTeamsAPI1 = await msTeamsAPI();
      await tryMSMatchTheme();
      let loginService = msTeamsAPI1.getLoginService();
      await loginService.onReady();
      try {
        await msTeamsAPI1.getTeamsApp().app.initialize();
      } catch (e) {
        console.log('microsoftTeams.initialize failed (probably not in teams so we skip it)', e);
      }
      msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
      const instanceSettings = await (await msTeamsAPI()).getTeamsApp().pages.getConfig();
      if (instanceSettings.websiteUrl) {
        try {
          new URL(instanceSettings.websiteUrl); // test url valide
          setUrl(instanceSettings.websiteUrl);
        } catch (ex) {
          console.error(ex);
        }
      }
      const callbackUrl = async (msg) => {
        try {
          let url = msg.url;
          setUrl(url);
          const roomurl = new URL(url); // test url valide
          if (url.startsWith('https://microverse')) {
            console.log('croquet url detected');
            setFullUrl(url);
          } else {
            const teamsParams = btoa(encodeURIComponent(JSON.stringify(await loginService.getTeamsLoginService().getUserInfo())));
            roomurl.searchParams.append(MSTEAMS_QUERY_PARAM, teamsParams);
            let data = (await roomService()).parseUrl(roomurl.toString());
            let token = await (await roomService()).getEmbedToken(data.roomSID, data.origin);
            roomurl.searchParams.append('embed_token', token);
            const finalUrl = roomurl.toString();
            console.log(finalUrl);
            setFullUrl(finalUrl);
            setUrl(finalUrl);
          }
        } catch (ex) {
          console.error(ex);
        }
      };
      msTeamsAPI1.getMSEvents().on(CHANGE_SETTINGS_URL, callbackUrl);

      return () => {
        msTeamsAPI1.getMSEvents().off(CHANGE_SETTINGS_URL, callbackUrl);
      };
    })();

    return () => {
      // This function will be called on component unmount
    };
  }, []);

  useEffect(() => {
    // This effect handles the URL validation logic
    if (url) {
      try {
        new URL(url);
        (async () => {
          let msTeamsAPI1 = await msTeamsAPI();
          msTeamsAPI1.getTeamsApp().pages.config.setValidityState(true);
        })();
      } catch (e) {
        //ignore error
      }
    }
  }, [url]);

  return (
      <div style={{ margin: '8px' }}>
        {!initialized && <Loader />}
        {initialized && (
            <>
              <SignIn />
              <RoomSection
                  roomUrl={url}
                  suggestedDisplayName={suggestedDisplayName}
                  onChangeRoomUrl={async (url) => {
                    if (!url) {
                      await (async () => {
                        let msTeamsAPI1 = await msTeamsAPI();
                        msTeamsAPI1.getTeamsApp().pages.config.setValidityState(false);
                      })();
                    }
                    await (await msTeamsAPI()).changeUrlSettings(url);
                  }}
                  onChangeSuggestedDisplayName={(text) => {
                    setSuggestedDisplayName(text);
                  }}
              />
            </>
        )}
      </div>
  );
};
