import { getContext, msTeams } from "./MsTeams";

export async function redirectToTeamsSidePanel(){
  if(msTeams()) {
    let url = new URL(window.location.href);
    if(url.searchParams.get("msForceHub")){
      return;//do not redirect in this case
    }
    await getContext((context)=>{
      if(context.frameContext === "sidePanel" && !(context.hostClientType === "android" || context.hostClientType === "ios")) {
        window.location.replace(window.location.origin + "/microsoft-settings.html?msteams=true");
      }
      //else continue android ios or desktop content
    });
  }
}