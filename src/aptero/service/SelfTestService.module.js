import qsTruthy from "../../utils/qs_truthy";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

//TODO detect for others
// [done] connected / disconected
// mic on before the end

// TODO detect for myself
// [done] trow error
// [done] console error??
// global status ok or not

export class SelfTestServiceModule {
  clients = {};
  errorDetected = false;
  consoleErrorDetected = false;
  notifyUpdate = () => {
  };

  constructor() {
    this.testMode = qsTruthy("test");
    if (this.testMode) {
      const self = this;
      const oldcerr = console.error;
      console.error = (data1,...data) => {
        this.consoleErrorDetected = true;
        self.notifyUpdate();
        oldcerr(data1,data);
      }
      window.addEventListener("error", () => {
        this.errorDetected = true;
        self.notifyUpdate();
      });

      waitForDOMContentLoaded().then(() => {
        document.body.addEventListener("clientConnected", (evt) => {
          console.log("clientConnected", evt);
          let clientID = evt.detail.clientId;
          if (clientID !== NAF.clientId) {
            this.createClient(clientID);
            self.notifyUpdate();
          }
        });
        document.body.addEventListener("clientDisconnected", (evt) => {
          console.log("clientDisconnected", evt);
          let clientID = evt.detail.clientId;
          if (clientID !== NAF.clientId) {
            this.createClient(clientID);
            this.clients[clientID].connected = false;
            self.notifyUpdate();
          }
        });
      });
    }
  }

  updateAllFromPresence(){
    const state = window.APP.hubChannel.presence.state;
    Object.keys(window.APP.hubChannel.presence.state).forEach(clientID => {
      if (clientID !== NAF.clientId && this.clients[clientID].connected) {
        this.createClient(clientID);
        this.clients[clientID].displayName = state[clientID].metas[0].profile.displayName;
        this.clients[clientID].identityName = state[clientID].metas[0].profile.identityName;
      }
    });
    this.notifyUpdate();
  }

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  notifySceneEntered() {
    if (this.testMode) {
      AFRAME.scenes[0].addEventListener("presence_updated", (e)=>{
        this.createClient(e.detail.sessionId);
        this.updateAllFromPresence();
        if (e.detail.profile && e.detail.sessionId !== NAF.clientId && this.clients[e.detail.sessionId].connected) {
          this.clients[e.detail.sessionId].displayName = e.detail.profile.displayName;
        }
      });
      this.updateAllFromPresence();
      setTimeout(()=>{
        if(!window.APP.store.state.profile.displayName.startsWith("TEST_BOT_")) {
          window.APP.store.update({
            profile: {
              displayName: "TEST_BOT_" + this.getRndInteger(100000, 900000),
            }
          })
          AFRAME.scenes[0].emit("avatar_updated");
        }
      },500);
    }
  }

  createClient(id) {
    if (NAF.clientId) {
      delete this.clients[NAF.clientId];
    }
    if (id === NAF.clientId) {
      return;
    }
    if(!this.clients[id]) {
      this.clients[id] = { id: id, connected: true };
    }
  }

  onUpdate(callback) {
    this.notifyUpdate = callback;
  }

  isTestMode() {
    return this.testMode;
  }

  startSelfTest() {
    if (this.testMode) {
      console.log("TEST MODE ENABLED");
      waitForDOMContentLoaded().then(() => {
        window.APP.store.state.preferences.showFPSCounter = true;
      });
    }
  }

  startMicTest() {
    //reset mic state
    this.micTestInProgress = true;
    Object.keys(this.clients).forEach(key => {
      this.clients[key].micTest = false;
    });
    this.notifyUpdate();
  }

  stopMicTest() {
    this.micTestInProgress = false;
  }
}

export const selfTestService = new SelfTestServiceModule();
