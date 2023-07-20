import {Button} from "@fluentui/react-northstar";
import React from "react";
import {msTeamsAPI} from "../../../axolotis/modules/basic/ImportHelper";

export function OpenAppMenu({style}:{style?: React.CSSProperties}) {
    return <Button
        primary
        style={style}
        onClick={async () => {
            const msTeamsAPI1 = await msTeamsAPI();
            const appInstallDialog = msTeamsAPI1.getAppInstallDialog();
            let appId = msTeamsAPI1.getAppId();
            if (window.location.href.indexOf("localhost") >= 0) {
                //check the url of the tab teams to know the app id
                appId = "2b5b7def-36fb-4329-98a1-77b316e02b13";
            }
            console.log("appId", appId);
            // Open an app install dialog from your tab
            if (appInstallDialog.isSupported()) {
                const dialogPromise = await appInstallDialog.openAppInstallDialog({appId});
            } else { /* handle case where capability isn't supported */
            }
        }
        }
    >Setup Room</Button>;
}
