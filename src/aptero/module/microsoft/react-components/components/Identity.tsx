import * as React from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { LightProfileCard } from "./LightProfileCard";
import { FormattedMessage } from "react-intl";
import {useEffect, useState} from "react";
import {MsTeamsAPI} from "@aptero/axolotis-module-teams";
import {msTeamsAPI} from "../../../axolotis/modules/basic/ImportHelper";
import {License} from "./License";
import {Authorize} from "./Authorize";

export function Identity(props) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<MsTeamsAPI>(null);
  const [error, setError] = useState(null);
  useEffect( () => {
    // Similar to componentDidMount and componentDidUpdate:
    (async ()=>{
      setService(await msTeamsAPI());
      setLoading(false);
    })();
  },[]);

  const requestAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      await service.getLoginService().login(false);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };
  //https://docs.microsoft.com/en-us/graph/toolkit/components/person-card
  return (
    <>
      {!loading && (

        <span style={{ margin: "8px" }}>
          <span style={{ margin: "8px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "8px" }}>
          {service && service.getLoginService().isSignedIn() && <LightProfileCard />}
          {/*!error && <><p><FormattedMessage id="microsoft.settings.account-auth.authorize2"
                                          defaultMessage="(Optional) Authorize this app to access advanced features."/>
          </p>
            <Button primary content="Authorize" disabled={loading} onClick={requestAuth}
            style={{height: "auto"}}/></>
          */}
          {service && !service.getLoginService().isSignedIn() && (
            <Button
              primary
              content="Sign In"
              disabled={loading}
              onClick={async () => {
                await requestAuth();
              }}
              style={{ height: "auto" }}
            />
          )}

          {service && service.getLoginService().isSignedIn() && (
            <Button
              primary
              content="Sign Out"
              disabled={loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  await service.getLoginService().logout();
                  setLoading(false);
                } catch (e) {
                  setError(e);
                  setLoading(false);
                }
              }}
              style={{ height: "auto" }}
            />
          )}<License/><Authorize/></span>
          {error && (
              <p>
                <FormattedMessage
                    id="microsoft.settings.account-auth.authorize1"
                    defaultMessage="Failed to authorize. Please contact the support at admin@aptero.co and past the following error detail:"
                />
                <br /> {error.toString()}
              </p>
          )}
        </span>
      )}
      {loading && <Loader />}
    </>
  );
}
