import React from "react";
import { createRoot } from "react-dom/client";
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
import {initIOC} from "./aptero/module/axolotis/AxInit";
registerTelemetry("/home", "Hubs Home Page");

initIOC();

window.APP = { store };
function HomeRoot() {
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

const container = document.getElementById("home-root");
const root = createRoot(container);
root.render(<HomeRoot />);
