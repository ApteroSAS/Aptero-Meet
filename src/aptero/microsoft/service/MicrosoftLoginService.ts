import { msTeams} from "./MsTeams";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MicrosoftOauthLoginService } from "./MicrosoftOauthLoginService";
import { TeamsLoginService } from "./TeamsLoginService";
import { MsToNativeLoginBridge } from "./MsToNativeLoginBridge";
import { getAuthEvents, SIGN_IN_COMPLETE } from "./AuthEvent";

export class MicrosoftLoginService {
  authInProgress = false;
  msGraphService = new MicrosoftGraphService();
  msToNativeLoginBridge = new MsToNativeLoginBridge();
  microsoftOauthLoginService = new MicrosoftOauthLoginService(this.msGraphService,this.msToNativeLoginBridge);
  teamsLoginService = new TeamsLoginService(this.msGraphService,this.msToNativeLoginBridge);

  async passiveLogin() {
    if(!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(()=>{
        this.authInProgress = false;
      },20000);
        if(msTeams()){
          await this.teamsLoginService.passiveLogin();
          this.authInProgress = false;
        }else{
          await this.microsoftOauthLoginService.passiveLogin();
          this.authInProgress = false;
        }
        getAuthEvents().emit(SIGN_IN_COMPLETE);
    }
  }

  async login() {
    if(!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(()=>{
        this.authInProgress = false;
      },20000);
      if(msTeams()){
        await this.teamsLoginService.login();
        this.authInProgress = false;
      }else{
        await this.microsoftOauthLoginService.login();
        this.authInProgress = false;
      }
      getAuthEvents().emit(SIGN_IN_COMPLETE);
    }
  }

  getUserAccount() {
    return this.msToNativeLoginBridge.getUserAccount();
  }

  getName() {
    return this.msToNativeLoginBridge.getName();
  }

  async logout() {
    if(!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(()=>{
        this.authInProgress = false;
      },20000);
      this.msToNativeLoginBridge.clearProfile();
      if(msTeams()){
        await this.teamsLoginService.logout();
        this.authInProgress = false;
      }else{
        await this.microsoftOauthLoginService.logout();
        this.authInProgress = false;
      }
    }
  }

  displayProfilePhoto() {
    return this.msToNativeLoginBridge.displayProfilePhoto();
  }
}

export const microsoftLoginService = new MicrosoftLoginService();

