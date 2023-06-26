import * as React from "react";
import {useLicense} from "./useLicense";

function getLastPart(input: string, delimiter: string = '.'): string {
    const parts = input.split(delimiter);
    return parts[parts.length - 1];
}

export function License() {
    const license = useLicense("offer-saas-aptero","No License");
    return (<>{license && <div> License : {getLastPart(license)}</div>}</>);
}
