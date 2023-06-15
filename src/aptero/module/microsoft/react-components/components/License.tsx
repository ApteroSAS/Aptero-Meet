import * as React from "react";
import {useEffect, useState} from "react";
import {useInjection} from "inversify-react";
import {
    MicrosoftGraphService,
    MICROSOFT_GRAPH_SERVICE,
    MicrosoftLoginService,
    MICROSOFT_LOGIN_SERVICE
} from "@aptero/axolotis-module-teams";
import {Authorize} from "./Authorize";





const DEFAULT_LICENSE = "Free";

export function License() {
    let microsoftGraphService = useInjection<MicrosoftGraphService>(MICROSOFT_GRAPH_SERVICE);
    let microsoftLoginService = useInjection<MicrosoftLoginService>(MICROSOFT_LOGIN_SERVICE);
    const [license, setLicense] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                console.log("getUsagesRights");
                await microsoftLoginService.onReady();
                const data = await microsoftGraphService.getUsagesRights( "offer-saas-aptero");
                setLicense(data.length > 0 ? data[0] : DEFAULT_LICENSE);
            } catch (e) {
                console.error(e);
                setLicense("Free");
            }
        })();
    }, []);
    return (<>{license && <div> License : {license}</div>}</>);
}
