import * as React from "react";
// @ts-ignore
import styles from './MeetingSidePanel.scss';
import classNames from "classnames";
import { useEffect, useState } from "react";
import { getContext, msTeams } from "../service/MsTeams";
import * as microsoftTeams from "@microsoft/teams-js";
import { Button, Loader } from "@fluentui/react-northstar";
import { FormattedMessage } from "react-intl";

//https://fluentsite.z22.web.core.windows.net/0.60.1

export function MeetingSidePanel() {
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("mobile");
  const switchToRoom = ()=>{
    microsoftTeams.settings.getSettings((instanceSettings) => {
      if (instanceSettings.websiteUrl) {
        let url = new URL(instanceSettings.websiteUrl);//test url valide
        url.searchParams.set("msForceHub","true");
        window.location.replace(url.toString());
      }
    });
  }
  useEffect(() => {
    if (msTeams()) {
      getContext((context) => {
        if (context.frameContext === "sidePanel" && (context.hostClientType === "android" || context.hostClientType === "ios")) {
          setContext("mobile");
          //switchToRoom();//This is just in case but it will not occure here since the sidepage loaded initially is hub.html
        }else{
          setContext("desktop");
        }
        setLoading(false);
      });
    }
  }, []);

  return (<>
      {loading && <Loader/>}
      {!loading &&
        <div className={classNames(styles.sidePanelBody)}>
          {context!=="mobile" && <img className={classNames(styles.fleche)} src="../../../../assets/aptero/microsoft/fleche.svg" alt="fleche"/>}
          {context!=="mobile" && <div style={{height:"100px"}}></div>}
          <div style={{height:"20px"}}></div>
          <main className={classNames(styles.main)}>
            <div className={classNames(styles.cubes)}>
              <img className={classNames(styles.B)} src="../../../../assets/aptero/microsoft/cubeB.svg" alt="B"/>
              <img className={classNames(styles.R)} src="../../../../assets/aptero/microsoft/cubeR.svg" alt="R"/>
              <img className={classNames(styles.J)} src="../../../../assets/aptero/microsoft/cubeJ.svg" alt="J"/>
            </div>
            {context!=="mobile" && <p> To start your 3D meeting, click the share button on&nbsp;top of this panel</p>}
            {context!=="mobile" && <p style={{
              fontSize: "0.8em",
              lineHeight: "1em",
              fontWeight: "500"}}> This will start the 3D meeting for everyone</p>}
            {context!=="mobile" && <p><b style={{fontSize:"2em"}}> or </b></p>}
            <p> Go inside the virtual room <span style={{fontSize:"1.3em"}}>alone</span></p>
            <p style={{
              fontSize: "0.8em",
              lineHeight: "1em",
              fontWeight: "500"}}> in this case the experience will not be shared to everyone in the meeting </p>
            <p><Button primary={true} onClick={()=>{switchToRoom()}}><FormattedMessage id="microsoft.settings.change-scene" defaultMessage="Enter Alone"/></Button></p>
          </main>
          <section className={classNames(styles.tuto)}>
            <div>
              <p className={classNames(styles.walk)}> Use the arrow keys to walk in the&nbsp;room </p>
              <p className={classNames(styles.look)}> Use your mouse to look around </p>
            </div>
          </section>
        </div>
      }
    </>
  );
}
