import {useEffect, useState} from "react";
import {msTeamsAPI, msTeamsAPILight} from "../../../axolotis/modules/basic/ImportHelper";

export function useContext() {
    const [context, setContext] = useState(null);
    useEffect(() => {
        (async () => {
            if (msTeamsAPILight().msTeams()) {
                await (await msTeamsAPI()).getContext(async (context) => {
                    setContext(context);
                });
            }
        })()
    },[]);
    return context;
}

export function useDeviceType(): "mobile" | "desktop" | "loading" {
    const [deviceType, setDeviceType] = useState<"mobile" | "desktop" | "loading">("loading");
    useEffect(() => {
        (async () => {
            if (msTeamsAPILight().msTeams()) {
                await (await msTeamsAPI()).getContext(async (context) => {
                    const clientType = context.app.host.clientType;
                    if (context.page.frameContext === "sidePanel" && (clientType === "android" || clientType === "ios")) {
                        setDeviceType("mobile");
                    } else {
                        setDeviceType("desktop");
                    }
                });
            }
        })()
    },[]);
    return deviceType;
}
