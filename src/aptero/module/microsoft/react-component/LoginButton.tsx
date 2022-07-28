import * as React from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { LightProfileCard } from "./LightProfileCard";
import { FormattedMessage } from "react-intl";
import { microsoftLoginService } from "../service/MicrosoftLoginService";
import { useState } from "react";

export function LoginButton(props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestAuth = async () => {
      try {
          setLoading(true);
          setError(null);
          await microsoftLoginService.login(false);
          setLoading(false);
      }catch (e){
          setError(e);
          setLoading(false);
      }
  };
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
                await requestAuth();
              }} style={{ height: "auto" }}/>}

          {microsoftLoginService.isSignedIn() &&
            <Button primary content="Sign Out" disabled={loading} onClick={
              async () => {
                  try {
                      setLoading(true);
                      setError(null);
                      await microsoftLoginService.logout();
                      setLoading(false);
                  }catch (e) {
                      setError(e);
                      setLoading(false);
                  }
              }} style={{ height: "auto" }}/>
          }
        </div>
      }
      {loading && <Loader/>}
    </>
  );
}
