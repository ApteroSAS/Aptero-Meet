import * as React from "react";
import { msTeamsAPILight , msTeamsAPI} from "@aptero/axolotis-module-teams";
import {Provider, Loader, teamsTheme} from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1
import {MeetingSidePanel} from "./MeetingSidePanel";
import {TabConfig} from "./TabConfig";



export class MSettingsMain extends React.Component {
  url = new URL(window.location.href);
  state = {
    page: this.url.searchParams.get("mode") || "loading"
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
              //https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
              if (context.frameContext === "sidePanel") {
                this.setState({ page: "sidePanel" });
              } else {
                this.setState({ page: "settings" });
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
      {this.state.page === "loading" && <Loader/>}
      {this.state.page === "no-msteams" && <div>Please Open in MS Teams</div>}
      {this.state.page === "sidePanel" && <MeetingSidePanel/>}
      {this.state.page === "settings" && <TabConfig/>}
    </Provider>
  }
}