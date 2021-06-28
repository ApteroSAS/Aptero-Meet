import qsTruthy from "../../utils/qs_truthy";
import { waitForDOMContentLoaded } from "../../utils/async-utils";

//TODO detect for others
// [done] connected / disconected
// mic on before the end

// TODO detect for myself
// console error
// global status ok or not

export class SelfTestService {
  clients = {};
  errorDetected = false;
  notifyUpdate = () =>{};
  constructor(){
    this.testMode = qsTruthy("test");
    if(this.testMode){
      window.addEventListener('error', () => {
        this.errorDetected = true;
        this.notifyUpdate();
      });
      waitForDOMContentLoaded().then(() => {
        document.body.addEventListener("clientConnected", (evt) => {
          console.log("clientConnected", evt);
          let clientID = evt.detail.clientId;
          this.createClient(clientID);
          this.notifyUpdate();
        });
        document.body.addEventListener("clientDisconnected", (evt) => {
          console.log("clientDisconnected", evt);
          let clientID = evt.detail.clientId;
          if(clientID!==NAF.clientId) {
            this.clients[clientID].disconected = true;
            this.notifyUpdate();
          }
        });
      });
    }
  }

  createClient(id){
    if(NAF.clientId){
      delete this.clients[NAF.clientId];
    }
    if(id===NAF.clientId){
      return;
    }
    this.clients[id]=this.clients[id] || { id: id,disconected:false };
  }

  onUpdate(callback){
    this.notifyUpdate = callback;
  }

  isTestMode() {
    return this.testMode;
  }

  startSelfTest(){
    if(this.testMode) {
      console.log("TEST MODE ENABLED");
      waitForDOMContentLoaded().then(() => {
        window.APP.store.state.preferences.showFPSCounter = true
      })
    }
  }
}

export const selfTestService = new SelfTestService();
