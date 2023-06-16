import React, {useEffect, useState} from "react";
import {useInjection} from "inversify-react";
import {
    MICROSOFT_GRAPH_SERVICE,
    MICROSOFT_LOGIN_SERVICE,
    MicrosoftGraphService,
    MicrosoftLoginService
} from "@aptero/axolotis-module-teams";
import {Button} from "@fluentui/react-northstar";
import {useLicense} from "./useLicense";

export const NoLicenseMessage: React.FC<any> = (props) => {
    return (<div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%"}}>
            <div style={{fontSize:"2em",fontWeight:"bold"}}>You don't have a license</div>
            <div style={{fontSize:"1.5em",fontWeight:"bold"}} >Please go to microsoft AppSource to get licenses</div>
        </div>);
}

export const EditorFrame: React.FC<any> = (props) => {
    if(window.location.href.indexOf("localhost") > -1) {
        return (<iframe src={"https://alphahub.aptero.co/opal/"}
                        style={{width: "100%", height: "100%", border: "none", overflow: "hidden"}}></iframe>);
    }else {
        return (<iframe src={"/opal/"} style={{width:"100%",height:"100%",border:"none",overflow:"hidden"}}></iframe>);
    }
}

export const RoomEditor: React.FC<any> = (props) => {
    let license;
    if(window.location.href.indexOf("localhost") > -1) {
        license = useLicense("offer-saas-aptero.free", null);
    }else {
        license = useLicense("offer-saas-aptero.tier-1",null);
    }
    return (<div style={{flexGrow:1,backgroundColor:"aliceblue",border:"none",overflow:"hidden"}}>
        {license ? <EditorFrame/> : <NoLicenseMessage/>}
    </div>);
}
