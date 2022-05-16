import { MICROSOFT_SERVICE, getService } from "../axolotis/AxolotisSystem";
import { Component } from "@aptero/axolotis-player";

export const MICROSOFT_AUTH_ERROR = "error_microsoft_not_authorized";
export const MSTEAMS_QUERY_PARAM = "msteams";
const qs = new URLSearchParams(location.search);
let msmode = !!qs.get(MSTEAMS_QUERY_PARAM);

declare const window;
export function msTeams(){
  return msmode;
}

export function msPassiveLoginCheckNeeded(){
  return window.APP.store.state.profile.microsoftUser || msTeams();
}

export async function preFetchConvertMicrosoftUrl(url){
  if (url.indexOf("sharepoint.com") === -1) {
    let urlService = (await getService<any>(MICROSOFT_SERVICE)).getUrlService();
    url = await urlService.preFetchConvertMicrosoftUrl(url);
  }
  return url;
}

export class MsTeams implements Component{
  getType(): string {
    return MsTeams.name;
  }
  msTeams(){
    return msmode;
  }

  msPassiveLoginCheckNeeded(){
    return window.APP.store.state.profile.microsoftUser || msTeams();
  }

  async preFetchConvertMicrosoftUrl(url){
    if (url.indexOf("sharepoint.com") === -1) {
      let urlService = (await getService<any>(MICROSOFT_SERVICE)).getUrlService();
      url = await urlService.preFetchConvertMicrosoftUrl(url);
    }
    return url;
  }
}