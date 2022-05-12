import {getContext, msTeams, MSTEAMS_QUERY_PARAM} from "./MsTeams";

export async function redirectToTeamsSidePanel(){
  if(msTeams()) {
    let url = new URL(window.location.href);
    if(url.searchParams.get("msForceHub")){
      return;//do not redirect in this case
    }
    await getContext((context)=>{
      if(context.frameContext === "sidePanel") {
        window.location.replace(window.location.origin + "/microsoft-settings.html?"+MSTEAMS_QUERY_PARAM+"=true");
      }
      //else continue
    });
  }
}