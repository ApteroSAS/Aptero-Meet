import * as React from "react";
import {Provider, Loader, teamsTheme} from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1
import {MeetingSidePanel} from "./MeetingSidePanel";
import {TabConfig} from "./TabConfig";
import classNames from "classnames";
import styles from "./MSettingsMain.scss";
import {msTeamsAPI, msTeamsAPILight} from "../../../axolotis/modules/basic/ImportHelper";
import {AdminPanel} from "./AdminPanel";



export class MSettingsMain extends React.Component {
  url = new URL(window.location.href);
  state = {
    page: this.url.searchParams.get("mode") || "loading"
    //Note to debug use window.location.href='https://localhost:53000/microsoft-settings.html?msteams=true&mode=sidePanel'
  };

  constructor(props) {
    super(props);
    (async () => {
      try {
        await (await msTeamsAPI()).getLoginService().passiveLogin();
      } catch (e) {
        console.error(e);
      } finally {
        if (this.state.page === "loading") {
          if (msTeamsAPILight().msTeams()) {
            await (await msTeamsAPI()).getContext((context) => {
              console.log(context);
              //https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
              if (context.page.frameContext === "sidePanel") {
                this.setState({ page: "sidePanel" });
              } else if (context.page.frameContext === "settings") {
                this.setState({ page: "settings" });
              }else if (context.page.frameContext === "content") {
                this.setState({ page: "content" });
              } else  {
                this.setState({ page: "content" });
              }
            });
          }else{
            this.setState({ page: "no-msteams" });
          }
        }
      }
    })()
  }

  render() {
    return <Provider theme={teamsTheme}>
      <div className={classNames(styles.themedBackground)}>
        {this.state.page === "loading" && <Loader/>}
        {this.state.page === "no-msteams" && <div>Please Open in MS Teams</div>}
        {this.state.page === "sidePanel" && <MeetingSidePanel/>}
        {this.state.page === "settings" && <TabConfig/>}
        {this.state.page === "content" && <AdminPanel/>}
      </div>
    </Provider>
  }
}
