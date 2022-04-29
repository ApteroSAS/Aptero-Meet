import * as React from "react";
import {Button } from "@fluentui/react-northstar";
import {useGraph} from "../lib/useGraph";
import {Login} from "@microsoft/mgt-react";
import {LightProfileCard} from "./LightProfileCard";
import {FormattedMessage} from "react-intl";
import {microsoftLoginService} from "../service/MicrosoftLoginService";
import { getScopes, getScopesLight } from "../service/scope";

export function AccountAuthV2(props) {

    const {loading, error, data, reload} = useGraph(
        async (graph) => {
            await microsoftLoginService.passiveLogin();
            const profile = await graph.api("/me").get();
            let photoUrl = "";
            try {
                const photo = await graph.api("/me/photo/$value").get();
                photoUrl = URL.createObjectURL(photo);
            } catch {
                // Could not fetch photo from user's profile, return empty string as placeholder.
            }
            return {profile, photoUrl};
        },
        {scope: getScopesLight()}
    );

    const requestAuth = async () => {
        await microsoftLoginService.login();
        reload();
    };

    console.log("user id :" + data?.profile.id);
    //https://docs.microsoft.com/en-us/graph/toolkit/components/person-card
    return (
        <>
            {!data &&
                <div style={{margin: "8px"}}>
                    <LightProfileCard/>
                    {!loading && <>
                        {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message */}
                        {error && <p><FormattedMessage id="microsoft.settings.account-auth.authorize1"
                                                       defaultMessage="Failed to authorize. Please contact the support at admin@aptero.co and past the following error detail:"/>
                            <br/> {error.toString()}</p>}
                        {!error && <p><FormattedMessage id="microsoft.settings.account-auth.authorize2"
                                                        defaultMessage="(Optional) Authorize this app to access advanced features."/>
                        </p>}
                        <Button primary content="Authorize" disabled={loading} onClick={requestAuth}
                                style={{height: "auto"}}/>
                    </>}
                </div>
            }
            {!loading && data && <Login {...props}
                                        loginInitiated={() => {
                                            requestAuth();
                                        }}
                                        logoutInitiated={() => {
                                            microsoftLoginService.logout();
                                        }}/>}
        </>
    );
}
