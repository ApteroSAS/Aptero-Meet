import React, {useEffect} from "react";
import {Sidebar} from "../../../../react-components/sidebar/Sidebar";
import {CloseButton} from "../../../../react-components/input/CloseButton";
import {getClones} from "../LoadBalancer";

export function InstancesSidebarContainer({onClose}) {
    const [instances, setInstances] = React.useState({});
    useEffect(() => {
        (async () => {
            let instances = (await getClones()).clones;
            setInstances(instances);
        })()
    }, []);
    return (
        <Sidebar
            title={"Instances"}
            beforeTitle={<CloseButton onClick={onClose}/>}
        >
            <div>{Object.keys(instances).map(value => {
                return <span key={value}>{JSON.stringify(instances[value])} </span>
            })}</div>
        </Sidebar>
    );
}