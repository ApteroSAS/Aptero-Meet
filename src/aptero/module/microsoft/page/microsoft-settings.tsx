import * as React from "react";
import ReactDOM from "react-dom";
import registerTelemetry from "../../../../telemetry";
import Store from "../../../../storage/store";
import "../../../../utils/theme";
import {AuthContextProvider} from "../../../../react-components/auth/AuthContext";
import {ThemeProvider} from "../../../../react-components/styles/theme";
import {WrappedIntlProvider} from "../../../../react-components/wrapped-intl-provider";
import {MSettingsMain} from "../react-components/page/MSettingsMain";
import {container} from "../../axolotis/IOCConfig";
import { Provider } from 'inversify-react';


registerTelemetry("/microsoft-settings", "microsoft-settings");

const store = new Store();
declare const window;
window.APP = { store };

const WrappedIntlProviderAny: any = WrappedIntlProvider;

const MicrosoftSettings = () => {
  return (
      <WrappedIntlProviderAny>
        <AuthContextProvider store={store}>
          <ThemeProvider store={store}>
            <Provider container={container}>
              <MSettingsMain />
              <span onClick={() => {
                window.location.reload();
              }} id="version" style={{
                margin: 0,
                top: 0,
                left: 'auto',
                right: '4px',
                bottom: '2px',
                fontSize: '0.7em',
                position: 'fixed'
              }}>{process.env.BUILD_VERSION}</span>
            </Provider>
          </ThemeProvider>
        </AuthContextProvider>
      </WrappedIntlProviderAny>
  );
};

export default MicrosoftSettings;


(async () => {
  const {initIOC} = await import("../../axolotis/AxInit");
  await initIOC();
  ReactDOM.render(<MicrosoftSettings/>, document.getElementById("home-root"));
})();
