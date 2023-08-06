import {Button} from "@fluentui/react-northstar";
import {PropertiesFormat, PROPERTY_KEY} from "@aptero/axolotis-module-teams";
import {useInjection} from "inversify-react";
import {Properties, PROPERTIES_SERVICE} from "@aptero/axolotis-module-basic";
import React from "react";

export function OpenAppSourceService() {
    const properties = useInjection<Properties>(PROPERTIES_SERVICE);
    const msLink = properties.get<PropertiesFormat>(PROPERTY_KEY).APP_SOURCE_LINK;
    return <Button primary style={{margin:"5px"}} size={"small"} onClick={()=>{window.open(msLink)}}> Open Appsource</Button>
}

export function OpenMicrosoftLicensePanel() {
    return <Button primary style={{margin:"5px"}} size={"small"} onClick={()=>{window.open("https://admin.microsoft.com/#/licenses")}}> Microsoft License Panel</Button>
}
