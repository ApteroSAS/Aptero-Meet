//adapterRegister
// beware of import compatibility eg scene.html does not have NAF available
/*import "./naf-twilio-adapter";
import "./naf-dialog-io-adapter";
import "./naf-agora-adapter";*/

import {Adapter} from "./AdapterI";

export async function lazyLoad(adapter:string):Promise<any>{
  if (adapter==="twilio") {
    return await import('./adapter/twilio/naf-twilio-adapter');
  }
  if (adapter==="dialog-io") {
    return await import('./adapter/dialog/naf-dialog-io-adapter')
  }
  if (adapter==="dialog-io-data-only") {
    return await import('./adapter/dialog/naf-dialog-io-data-only-adapter')
  }
  if (adapter==="agora") {
    return await import('./adapter/agora/naf-agora-adapter')
  }
  if (adapter==="none") {
    return await import('./adapter/old/naf-none-adapter')
  }
  if (adapter==="socketio") {
    return await import('./adapter/old/naf-socketio-adapter')
  }
}
