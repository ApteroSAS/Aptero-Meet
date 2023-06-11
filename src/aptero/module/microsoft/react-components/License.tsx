import * as React from "react";
import {useEffect, useState} from "react";
import {MsTeamsAPI} from "@aptero/axolotis-module-teams";
import {msTeamsAPI} from "../../axolotis/modules/basic/ImportHelper";

type UsageRights = {
    '@odata.context': string;
    value: {
        id: string;
        catalogId: string;
        serviceIdentifier: string;
        state: string;
    }[];
};

function extractIdentifiers(data: UsageRights, keyword: string): string[] {
    let identifiers: string[] = [];

    data.value.forEach(element => {
        if(element.serviceIdentifier.includes(keyword)) {
            identifiers.push(element.serviceIdentifier);
        }
    });

    return identifiers;
}

const DEFAULT_LICENSE = "Free";

export function License() {
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState<MsTeamsAPI>(null);
    const [license, setLicense] = useState(DEFAULT_LICENSE);
    useEffect(() => {
        // Similar to componentDidMount and componentDidUpdate:
        (async () => {
            let msTeamsAPI1 = await msTeamsAPI();
            let graph = msTeamsAPI1.getGraph();
            await graph.awaitReady();
            graph.getClient().api("/me/usageRights").version("beta").get().then((data) => {
                let strings = extractIdentifiers(data, "offer-saas-aptero");
                setLicense(strings.length > 0 ? strings[0] : DEFAULT_LICENSE);
            });
            setService(msTeamsAPI1);
            setLoading(false);
        })();
    }, []);
    return (!loading && <div> License : {license}</div>);
}
