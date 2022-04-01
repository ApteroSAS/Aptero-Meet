import React from "react";
import { Button, Flex } from "@fluentui/react-northstar";
import { useGraph } from "../../service/MicrosoftIntegration/lib/useGraph";
import { getScopes, logout, passiveAuth, userInteractionAuth } from "../../service/MicrosoftIntegration/Auth";
import { Login } from "@microsoft/mgt-react";
import { LightProfileCard } from "./LightProfileCard";
import {FormattedMessage} from "react-intl";

export function AccountAuth(props) {

  const { loading, error, data, reload } = useGraph(
    async (graph) => {
      await passiveAuth();
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
    { scope: getScopes() }
  );

  const requestAuth = async ()=>{
    await userInteractionAuth(()=>{
      console.error("consent is needed");
    })
    reload();
  }

  console.log("user id :" + data?.profile.id);
  //https://docs.microsoft.com/en-us/graph/toolkit/components/person-card
  return (
    <>
      {!data &&
        <div style={{ margin: "8px" }} >
            {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
          {!loading && error && <p>Failed to authorize. Please try again. <br /> Details: {error.toString()}</p>}
          {!loading && !error && <p><FormattedMessage id="microsoft.settings.account-auth.authorize" defaultMessage="Authorize this app to acces advanced features." /></p>}
          <Flex gap="gap.small">
            <LightProfileCard />
            <Button primary content="Authorize" disabled={loading} onClick={requestAuth} style={{ height: "auto" }} />
          </Flex>
        </div>
      }
      {!loading && data && <Login {...props} 
      loginInitiated={()=>{
        requestAuth();
      }} 
      logoutInitiated={()=>{
        logout();
      }}/>}
    </>
  );
}
