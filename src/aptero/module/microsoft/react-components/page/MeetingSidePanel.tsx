import * as React from "react";
// @ts-ignore
import styles from "./MeetingSidePanel.scss";
import classNames from "classnames";
import {useEffect, useState} from "react";
import {Loader} from "@fluentui/react-northstar";
import {tryMSMatchTheme} from "../components/MSThemeMatcher";
import {msTeamsAPI, msTeamsAPILight} from "../../../axolotis/modules/basic/ImportHelper";

//https://fluentsite.z22.web.core.windows.net/0.60.1

export function MeetingSidePanelMobileAfterInstall() {
    return <div className={classNames(styles.sidePanelBody)}>
        <div style={{height: "20px"}}></div>
        <main className={classNames(styles.main)}>
            <div className={classNames(styles.cubes)}>
                <img className={classNames(styles.B)} src="../../../../../assets/aptero/microsoft/cubeB.svg"
                     alt="B"/>
                <img className={classNames(styles.R)} src="../../../../../assets/aptero/microsoft/cubeR.svg"
                     alt="R"/>
                <img className={classNames(styles.J)} src="../../../../../assets/aptero/microsoft/cubeJ.svg"
                     alt="J"/>
            </div>
            <p> Your room is set up and ready to be shared to everyone</p>
            <p> Now you can go back to your meeting in the "Apps" section to share the app for everyone</p>
        </main>
    </div>
}

export function MeetingSidePanelInviteToShareArrow() {
    return <div className={classNames(styles.sidePanelBody)}>
        <img className={classNames(styles.fleche)} src="../../../../../assets/aptero/microsoft/fleche.svg"
             alt="fleche"/>
        <div style={{height: "100px"}}></div>
        <div style={{height: "20px"}}></div>
        <main className={classNames(styles.main)}>
            <div className={classNames(styles.cubes)}>
                <img className={classNames(styles.B)} src="../../../../../assets/aptero/microsoft/cubeB.svg"
                     alt="B"/>
                <img className={classNames(styles.R)} src="../../../../../assets/aptero/microsoft/cubeR.svg"
                     alt="R"/>
                <img className={classNames(styles.J)} src="../../../../../assets/aptero/microsoft/cubeJ.svg"
                     alt="J"/>
            </div>
            <p> Your room is set up and ready to be shared to everyone</p>
            <p> To start your 3D meeting, click the share button on&nbsp;top of this panel</p>
            <p
                style={{
                    fontSize: "0.8em",
                    lineHeight: "1em",
                    fontWeight: "500",
                }}
            >
                {" "}
                This will start the 3D meeting for everyone
            </p>
        </main>
        <section className={classNames(styles.tuto)}>
            <div>
                <p className={classNames(styles.walk)}> Use the arrow keys to walk in the&nbsp;room </p>
                <p className={classNames(styles.look)}> Use your mouse to look around </p>
            </div>
        </section>
    </div>
}

export function MeetingSidePanel() {
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState("mobile");
    useEffect(() => {
        (async () => {
            if (loading) {
                await tryMSMatchTheme();
                if (msTeamsAPILight().msTeams()) {
                    await (await msTeamsAPI()).getContext((context) => {
                        const clientType = context.app.host.clientType;
                        if (context.page.frameContext === "sidePanel" && (clientType === "android" || clientType === "ios")) {
                            //The current UI theme of the host. Possible values: "default", "dark", or "contrast".
                            if(context.app.theme === "default"){
                                setContext("mobile-default");//HACK we know that if the theme is default we are in the MeetingSidePanelMobileAfterInstall
                            }else{
                                setContext("mobile-dark");
                            }
                            //switchToRoom();//This is just in case but it will not occure here since the sidepage loaded initially is hub.html
                        } else {
                            setContext("desktop");
                        }
                        setLoading(false);
                    });
                }
            }
        })()
    }, [loading]);

    return (
        <>
            {loading && <Loader/>}
            {!loading && <>
                {context === "mobile-default" && <MeetingSidePanelMobileAfterInstall/>}
                {context === "mobile-dark" && <MeetingSidePanelInviteToShareArrow/>}
                {context === "desktop" && <MeetingSidePanelInviteToShareArrow/>}
                </>
            }
        </>
    );
}
