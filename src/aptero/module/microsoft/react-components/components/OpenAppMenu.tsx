import {Button} from "@fluentui/react-northstar";
import React, {useState} from "react";
import {msTeamsAPI} from "../../../axolotis/modules/basic/ImportHelper";
import {useContext} from "./useContext";
import {M365TeamsRedirectMessage} from "./M365TeamsRedirectMessage";

export function OpenAppMenu({style}: { style?: React.CSSProperties }) {
    const context = useContext();
    const [open, setOpen] = useState(false)
    return <><Button
        primary
        style={style}
        onClick={async () => {
            //console.log("context", context);
            if(context.app.host.name === "Teams" || context.app.host.name === "TeamsModern") {
            //if(context.app.host.name === "Office") { debug
                //context.app.host.name can be "Teams" or "Office"
                const msTeamsAPI1 = await msTeamsAPI();
                const appInstallDialog = msTeamsAPI1.getAppInstallDialog();
                let appId = msTeamsAPI1.getAppId();
                console.log("appId", appId);
                // Open an app install dialog from your tab
                if (appInstallDialog.isSupported()) {
                    const dialogPromise = await appInstallDialog.openAppInstallDialog({appId});
                } else { /* handle case where capability isn't supported */
                }
            }else{
                //TODO setstate to show message
                setOpen(true);
            }
        }}
    >Setup Room</Button>
    <M365TeamsRedirectMessage open={open} onClose={()=>{setOpen(false)}}/>
    </>;
}
