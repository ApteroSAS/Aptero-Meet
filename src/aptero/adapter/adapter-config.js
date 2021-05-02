import configs from "../../utils/configs";

let defaultAdapter = "dialog-io";

export function choseAdapter(){
  let adapter = defaultAdapter;
  //Aptero
  if(configs.APP_CONFIG.adapter) {
    adapter = configs.APP_CONFIG.adapter;
  }
  configs.APP_CONFIG.adapter = adapter;
  return adapter;
}