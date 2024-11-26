import React, { useEffect } from "react";
import { Sidebar } from "../../CustomPanel/Sidebar/Sidebar";
import { CloseButton } from "../../../../react-components/input/CloseButton";
import { ClonesI, getClones, getClonesSync } from "../LoadBalancer";
import {List, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";

import InboxIcon from '@mui/icons-material/Inbox';
export function InstancesSidebarContainer({ onClose }) {
  const [instances, setInstances] = React.useState<ClonesI>(getClonesSync().clones);
  useEffect(() => {
    (async () => {
      let instances = (await getClones()).clones;
      setInstances(instances);
    })();
  }, []);

  let totalPeople = 0;
  let totalMaxPeople = 0;
  for (const instancesKey in instances) {
    const instance = instances[instancesKey];
    totalMaxPeople+=instance.peopleMax;
    totalPeople+=instance.people;
  }

  return (
    <Sidebar
      title={`Instances (${totalPeople}/${totalMaxPeople})`}
      beforeTitle={<CloseButton onClick={onClose} lg={undefined} className={undefined}/>}
    >
      <List>{Object.keys(instances).map(value => {
        let instance = instances[value];
        const line = instance.name + " (" + instance.people + "/" + instance.peopleMax + ")";
        return <ListItemButton key={value} onClick={async () => {
          // move to new room without page load or entry flow
          const { changeHub } = await import("../../../../change-hub");
          changeHub(value);
          onClose();
        }}>
          <ListItemIcon>
            <InboxIcon/>
          </ListItemIcon>
          <ListItemText primary={instance.current?<b>{line}</b>:line}/>
        </ListItemButton>;
      })}</List>
    </Sidebar>
  );
}