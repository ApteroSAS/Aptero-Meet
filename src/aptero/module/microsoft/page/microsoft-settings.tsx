import * as React from "react";
import ReactDOM from "react-dom";
import registerTelemetry from "../../../../telemetry";
import Store from "../../../../storage/store";
import "../../../../utils/theme";
import { Provider, Loader, teamsTheme } from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1


registerTelemetry("/microsoft-settings", "microsoft-settings");
import "./../../axolotis/AxolotisSystem"
import {microsoftService, msTeamsService, MeetingSidePanel, TabConfig} from "@aptero/axolotis-module-teams";

const store = new Store();
declare const window;
window.APP = { store };

import { AuthContextProvider } from "../../../../react-components/auth/AuthContext";
import { ThemeProvider } from "../../../../react-components/styles/theme";
import { WrappedIntlProvider } from "../../../../react-components/wrapped-intl-provider";

const WrappedIntlProviderAny: any = WrappedIntlProvider;

(async ()=> {
  try {
    (await microsoftService()).getLoginService().passiveLogin();
  } catch (e) {
    console.error(e);
  }
})()
let url = new URL(window.location.href);
export class MicrosoftSettings extends React.Component<any, { page: string }> {
  state = {
    page: url.searchParams.get("mode") || "loading"
  };

  constructor(props) {
    super(props);
    if (this.state.page === "loading") {
      if (msTeamsService().msTeams()) {
        msTeamsService().getContext((context) => {
          //https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
          if (context.frameContext === "sidePanel") {
            this.setState({ page: "sidePanel" });
          } else {
            this.setState({ page: "settings" });
          }
        });
      }
    }
  }

  componentDidMount() {
  }

  render() {
    return <WrappedIntlProviderAny>
        <AuthContextProvider store={store}>
          <ThemeProvider store={store}>
            <Provider theme={teamsTheme}>
            {this.state.page === "loading" && <Loader/>}
            {this.state.page === "sidePanel" && <MeetingSidePanel/>}
            {this.state.page === "settings" && <TabConfig/>}
            </Provider>
            <span onClick={() => {
              window.location.reload();
            }} id="version" style={{
              "margin": 0,
              "top": 0,
              "left": "auto",
              "right": "4px",
              "bottom": "2px",
              "fontSize": "0.7em",
              "position": "fixed"
            }}>{process.env.BUILD_VERSION}</span>
          </ThemeProvider>
        </AuthContextProvider>
      </WrappedIntlProviderAny>;
  }

}

ReactDOM.render(<MicrosoftSettings/>, document.getElementById("home-root"));
