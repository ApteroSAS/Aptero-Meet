import React, {useEffect, useState} from "react";
import {Button} from "@fluentui/react-northstar";
import {useInjection} from "inversify-react";
import {
    MICROSOFT_GRAPH_SERVICE,
    MICROSOFT_LOGIN_SERVICE,
    MicrosoftGraphService,
    MicrosoftLoginService
} from "@aptero/axolotis-module-teams";

export const Authorize: React.FC<{ label:string }> = ({label} = {label:"Authorize"}) => {

    let microsoftGraphService = useInjection<MicrosoftGraphService>(MICROSOFT_GRAPH_SERVICE);
    let microsoftLoginService = useInjection<MicrosoftLoginService>(MICROSOFT_LOGIN_SERVICE);
    const [authorized, setAuthorized] = useState(true);

    useEffect(() => {
        (async () => {
            if(microsoftLoginService.isSignedIn()) {
                try {
                    await microsoftGraphService.getUserDetails();
                    setAuthorized(true);
                } catch (e) {
                    setAuthorized(false);
                }
            }
        })();
        return microsoftLoginService.onLogin(async () => {
            if(microsoftLoginService.isSignedIn()) {
                try {
                    await microsoftGraphService.getUserDetails();
                    setAuthorized(true);
                } catch (e) {
                    setAuthorized(false);
                }
            }
        });
    }, []);

    return (<>{!authorized && <Button onClick={() => microsoftLoginService.login()} style={{height: "auto"}}>{label}</Button>}</>);
}
