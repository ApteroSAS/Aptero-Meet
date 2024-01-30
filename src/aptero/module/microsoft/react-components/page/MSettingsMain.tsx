import * as React from "react";
import { Provider, Loader, teamsTheme } from "@fluentui/react-northstar";
import { MeetingSidePanel } from "./MeetingSidePanel";
import { TabConfig } from "./TabConfig";
import classNames from "classnames";
import styles from "./MSettingsMain.scss";
import { msTeamsAPI, msTeamsAPILight } from "../../../axolotis/modules/basic/ImportHelper";
import { AdminPanel } from "./AdminPanel";

export const MSettingsMain = () => {
  const url = new URL(window.location.href);
  const [page, setPage] = React.useState(url.searchParams.get("mode") || "loading");
  const [context, setContext] = React.useState("loading");

  React.useEffect(() => {
    (async () => {
      try {
        await (await msTeamsAPI()).getLoginService().passiveLogin();
      } catch (e) {
        console.error(e);
      } finally {
        if (page === "loading") {
          if (msTeamsAPILight().msTeams()) {
            await (await msTeamsAPI()).getContext(async (context) => {
              console.log(context);
              const frameContext = context.page.frameContext;
              setContext(frameContext);
              //https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
              /*
              export enum FrameContexts {
              /**
              * App's frame context from where settings page can be accessed.
              * See [how to create a configuration page.]( https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/create-tab-pages/configuration-page?tabs=teamsjs-v2)
              *
              settings = "settings",
                  /** The default context for the app where all the content of the app is displayed. *
                  content = "content",
                  /** Frame context used when app is running in the authentication window launched by calling {@link authentication.authenticate} *
                  authentication = "authentication",
                  /** The page shown when the user uninstalls the app. *
                  remove = "remove",
                  /** A task module is a pop-up window that can be used to display a form, a dialog, or other interactive content within the host. *
                  task = "task",
                  /** The side panel is a persistent panel that is displayed on the right side of the host and can be used to display content or UI that is relevant to the current page or tab. *
                  sidePanel = "sidePanel",
                  /** The stage is a large area that is displayed at the center of the host and can be used to display content or UI that requires a lot of space, such as a video player or a document editor. *
                  stage = "stage",
                  /** App's frame context from where meetingStage can be accessed in a meeting session, which is the primary area where video and presentation content is displayed during a meeting. *
                  meetingStage = "meetingStage"
                }
               */
              if (frameContext === "sidePanel") {
                setPage("sidePanel");
              } else if (
                  frameContext === "settings" ||
                  frameContext === "remove" ||
                  frameContext === "authentication" ||
                  frameContext === "task"
              ) {
                setPage("settings");
              } else if (frameContext === "content") {
                setPage("content");
              } else if(
                  frameContext === "meetingStage" ||
                  frameContext === "stage"){
                //should not since stage or meetingStage is the url of the room directly
                window.location.href = "https://www.aptero.co/help.html";
              } else {
                setPage("content");
              }
            });
          } else {
            window.location.href = "https://www.aptero.co/help.html";
          }
        }
      }
    })();
  }, [page]);

  return (
      <Provider theme={teamsTheme}>
        <div className={classNames(styles.themedBackground)} style={{ padding: 0, margin: 0 }}>
          {page === "loading" && <Loader />}
          {page === "no-msteams" && <div>Please Open in MS Teams</div>}
          {page === "sidePanel" && <MeetingSidePanel />}
          {page === "settings" && <TabConfig />}
          {page === "content" && <AdminPanel />}
        </div>
      </Provider>
  );
};
