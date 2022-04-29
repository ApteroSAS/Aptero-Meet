import * as React from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { useGraph } from "../lib/useGraph";
import { Login } from "@microsoft/mgt-react";
import { LightProfileCard } from "./LightProfileCard";
import { FormattedMessage } from "react-intl";
import { microsoftLoginService } from "../service/MicrosoftLoginService";
import { getScopes, getScopesLight } from "../service/scope";
import { useState } from "react";

export function LoginButton(props) {
  const [loading2, setLoading2] = useState(false);
  const { loading1, error, data, reload } = useGraph(
    async (graph) => {
      //await microsoftLoginService.passiveLogin();
      const profile = await graph.api("/me").get();
      let photoUrl = "";
      try {
        const photo = await graph.api("/me/photo/$value").get();
        photoUrl = URL.createObjectURL(photo);
      } catch {
        // Could not fetch photo from user's profile, return empty string as placeholder.
      }
      return { profile, photoUrl };
    },
    { scope: getScopesLight() }
  );

  const requestAuth = async () => {
    await microsoftLoginService.login();
  };
  const loading = loading1 || loading2;
  console.log("user id :" + data?.profile.id);
  //https://docs.microsoft.com/en-us/graph/toolkit/components/person-card
  return (
    <>
      {!loading &&
        <div style={{ margin: "8px" }}>
          {microsoftLoginService.isSignedIn() && <LightProfileCard/>}
          {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
          {error && <p><FormattedMessage id="microsoft.settings.account-auth.authorize1"
                                         defaultMessage="Failed to authorize. Please contact the support at admin@aptero.co and past the following error detail:"/>
            <br/> {error.toString()}</p>}
          {/*!error && <><p><FormattedMessage id="microsoft.settings.account-auth.authorize2"
                                          defaultMessage="(Optional) Authorize this app to access advanced features."/>
          </p>
            <Button primary content="Authorize" disabled={loading} onClick={requestAuth}
            style={{height: "auto"}}/></>
          */}
          <br/>
          {!microsoftLoginService.isSignedIn() &&
            <Button primary content="Sign In" disabled={loading} onClick={
              async () => {
                setLoading2(true);
                await requestAuth();
                setLoading2(false);
              }} style={{ height: "auto" }}/>}

          {microsoftLoginService.isSignedIn() &&
            <Button primary content="Sign Out" disabled={loading} onClick={
              async () => {
                setLoading2(true);
                await microsoftLoginService.logout();
                setLoading2(false);
              }} style={{ height: "auto" }}/>
          }
        </div>
      }
      {loading && <Loader/>}
    </>
  );
}
