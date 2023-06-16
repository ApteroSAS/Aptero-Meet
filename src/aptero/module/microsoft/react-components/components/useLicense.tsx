import {useInjection} from "inversify-react";
import {
    MICROSOFT_GRAPH_SERVICE,
    MICROSOFT_LOGIN_SERVICE,
    MicrosoftGraphService,
    MicrosoftLoginService
} from "@aptero/axolotis-module-teams";
import {useEffect, useState} from "react";

export function useLicense(filter: string,defaultValue: string = "no-license") {
    const [license, setLicense] = useState<string>(null);
    let microsoftGraphService = useInjection<MicrosoftGraphService>(MICROSOFT_GRAPH_SERVICE);
    let microsoftLoginService = useInjection<MicrosoftLoginService>(MICROSOFT_LOGIN_SERVICE);

    useEffect(() => {
        (async () => {
            if(microsoftLoginService.isSignedIn()) {
                await microsoftLoginService.onReady();
                const data = await microsoftGraphService.getUsagesRights(filter);
                setLicense(data.length > 0? data[0] : defaultValue);
            }
        })();
        return microsoftLoginService.onLogin(async () => {
            if(microsoftLoginService.isSignedIn()) {
                await microsoftLoginService.onReady();
                const data = await microsoftGraphService.getUsagesRights(filter);
                setLicense(data.length > 0? data[0] : defaultValue);
            }
        });
    }, []);
    return license;
}
