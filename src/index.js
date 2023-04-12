import React from "react";
import ReactDOM from "react-dom";
import { WrappedIntlProvider } from "./react-components/wrapped-intl-provider";
import registerTelemetry from "./telemetry";
import "./utils/theme";
import { HomePage } from "./react-components/home/HomePage";
import { AuthContextProvider } from "./react-components/auth/AuthContext";
import "./react-components/styles/global.scss";
import { ThemeProvider } from "./react-components/styles/theme";
import { store } from "./utils/store-instance";
import { setupVersionComp } from "./aptero/module/HubsBridge/utils/Version";
import AptHomeRoot from "./aptero/module/HubsBridge/AptHomeRoot";
registerTelemetry("/home", "Hubs Home Page");

window.APP = { store };
function Root() {
  setupVersionComp();
  return (
    <WrappedIntlProvider>
      <ThemeProvider store={store}>
        <AuthContextProvider store={store}>
          <HomePage />
          <AptHomeRoot />
        </AuthContextProvider>
      </ThemeProvider>
    </WrappedIntlProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById("home-root"));
