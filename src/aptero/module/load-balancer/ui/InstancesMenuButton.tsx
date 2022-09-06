import React from "react";
import { ReactComponent as ObjectsIcon } from "../../../../react-components/icons/Scene.svg";
import { customMenuService } from "../../../module/CustomPanel/CustomMenuService";
import {ContentMenuButton} from "../../../../react-components/room/ContentMenu"
import {hasInstances} from "../LoadBalancer";

export function InstancesMenuButton(props) {
    if(hasInstances()){
        return (
            <ContentMenuButton {...props}>
                <ObjectsIcon />
                <span>
          "Instances"
        </span>
            </ContentMenuButton>
        );
    }else{
        return <></>;
    }
}