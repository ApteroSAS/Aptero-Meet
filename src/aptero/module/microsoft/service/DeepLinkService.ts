import * as microsoftTeams from "@microsoft/teams-js";
import {getMSEvents, PROCESS_DEEPLINK} from "./MsTeams";

export class DeepLinkService{
    start(){
        getMSEvents().on(PROCESS_DEEPLINK,(data)=>{
            try{
                const link = data.link;
                microsoftTeams.executeDeepLink(link,(status,reason)=>{
                    console.log(status,reason);
                });
            }catch(err){
                console.error(err);
            }
        })
    }
}

export const deepLinkService = new DeepLinkService();
