import { msTeams } from "../../microsoft/service/MsTeams";

const qs = new URLSearchParams(location.search);

export function addEntryModeIfNotExist(entryMode){
  if(msTeams()){
    return;
  }
  const urlToConstruct = new URL(location.href);
  if (!urlToConstruct.searchParams.has("vr_entry_type")) {
    urlToConstruct.searchParams.set("vr_entry_type",entryMode);
    location.href = urlToConstruct.toString();
  }
}

export function getEntryMode(){
  let qsVREntryType = qs.get("vr_entry_type");
  if(msTeams()){
    qsVREntryType="2d_now";
  }
  return qsVREntryType;
}

export function duplicateEntryModeOnSrc(src,sceneEl){
  const windowUrl = new URL(location.href);
  const urlToConstruct = new URL(src);
  const isSameRoom = urlToConstruct.origin === windowUrl.origin && urlToConstruct.pathname === windowUrl.pathname;
  if(!isSameRoom) {
    if (sceneEl && sceneEl.is("vr-mode")) {
      urlToConstruct.searchParams.set("vr_entry_type", "vr_now");
    } else {
      urlToConstruct.searchParams.set("vr_entry_type", "2d_now");
    }
  }
  return urlToConstruct.toString();
}
