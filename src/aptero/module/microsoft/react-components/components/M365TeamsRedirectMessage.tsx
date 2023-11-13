import * as React from "react";
import {Button, Dialog} from "@fluentui/react-northstar";
import {OpenAppSourceTeamsApp, OpenTeams} from "./OpenAppSourceService";

export function M365TeamsRedirectMessage({open,onClose}:{open:boolean,onClose:()=>void}) {
    return <Dialog
        open={open}
        content={<>
        To use your room you have to add the Microsoft Teams application to your tenant by going to appsource then open Teams to setup the app and configure it there.
        <OpenAppSourceTeamsApp /><OpenTeams />
        </>}
        header="Teams Setup"
        confirmButton="Close"
        onConfirm={() => {
            onClose();
        }}
    />

}
