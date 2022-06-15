import * as React from "react";
import ReactDOM from "react-dom";
import registerTelemetry from "../../../../telemetry";
import Store from "../../../../storage/store";
import "../../../../utils/theme";


registerTelemetry("/microsoft-settings", "microsoft-settings");

const store = new Store();
declare const window;
window.APP = { store };

import { AuthContextProvider } from "../../../../react-components/auth/AuthContext";
import { ThemeProvider } from "../../../../react-components/styles/theme";
import { WrappedIntlProvider } from "../../../../react-components/wrapped-intl-provider";
import {MSettingsMain} from "../react-components/MSettingsMain";

const WrappedIntlProviderAny: any = WrappedIntlProvider;

export class MicrosoftSettings extends React.Component<any, { page: string }> {

  render() {
    return <WrappedIntlProviderAny>
        <AuthContextProvider store={store}>
          <ThemeProvider store={store}>
            <MSettingsMain />
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
