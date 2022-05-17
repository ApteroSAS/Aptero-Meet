import { Component, IServices } from "@aptero/axolotis-player";
import {Service} from "@aptero/axolotis-player";
import { microsoftLoginService } from "./service/MicrosoftLoginService";
import { redirectToTeamsSidePanel } from "./service/RedirectToSidePage";
import { microsoftUrlService } from "./service/MicrosoftUrlService";
import { processDeepLink } from "./service/MsTeams";
import "./service/TeamsTestHelper";

export class MicrosoftService implements Component{
  constructor() {
  }

  getLoginService(){
    return microsoftLoginService;
  }

  async redirectToTeamsSidePanel(){
    await redirectToTeamsSidePanel();
  }

  getUrlService(){
    return microsoftUrlService;
  }

  async processDeepLink(link){
    return processDeepLink(link);
  }

  getType(): string {
    return MicrosoftService.name;
  }
}

export class Factory implements Service<MicrosoftService>{
  constructor() {}
  async createService(services:IServices): Promise<MicrosoftService> {
    return new MicrosoftService();
  }
}