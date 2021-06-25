import qsTruthy from "../../utils/qs_truthy";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

const testMode = qsTruthy("test");

export function startSelfTest(){
  if(testMode) {
    console.log("TEST MODE ENABLED");
    waitForDOMContentLoaded().then(() => {
      window.APP.store.state.preferences.showFPSCounter = true
    })
  }
}
