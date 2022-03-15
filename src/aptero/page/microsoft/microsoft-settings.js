import React from "react";
import ReactDOM from "react-dom";
import { WrappedIntlProvider } from "./../../../react-components/wrapped-intl-provider";
import registerTelemetry from "./../../../telemetry";
import Store from "./../../../storage/store";
import "./../../../utils/theme";
import { SettingsPage } from "../../react-components/settings/SettingsPage";
import { AuthContextProvider } from "./../../../react-components/auth/AuthContext";
import "./../../../react-components/styles/global.scss";
import { ThemeProvider } from "./../../../react-components/styles/theme";
import { microsoftLoginService } from "../../service/MicrosoftIntegration/MicrosoftLoginService";

registerTelemetry("/home", "Hubs Home Page");


const store = new Store();
window.APP = { store };
function Root() {
  document.getElementById("version").innerHTML = process.env.BUILD_VERSION;
  return (
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <AuthContextProvider store={store}>
          <SettingsPage />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById("home-root"));
microsoftLoginService.passiveLogin();
