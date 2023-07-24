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
