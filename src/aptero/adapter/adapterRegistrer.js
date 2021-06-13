//adapterRegister
// beware of import compatibility eg scene.html does not have NAF available
/*import "./naf-twilio-adapter";
import "./naf-dialog-io-adapter";
import "./naf-agora-adapter";*/

export async function lazyLoad(adapter){
  if (adapter==="twilio") {
    await import('./naf-twilio-adapter')
  }
  if (adapter==="dialog-io") {
    await import('./naf-dialog-io-adapter')
  }
  if (adapter==="agora") {
    await import('./naf-agora-adapter')
  }
  if (adapter==="none") {
    await import('./naf-none-adapter')
  }
}
