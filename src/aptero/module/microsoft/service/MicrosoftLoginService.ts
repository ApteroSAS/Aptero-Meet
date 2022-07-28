import { msTeams} from "./MsTeams";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { MicrosoftOauthLoginService } from "./MicrosoftOauthLoginService";
import { TeamsLoginService } from "./TeamsLoginService";
import { MsToNativeLoginBridge } from "./MsToNativeLoginBridge";
import { getAuthEvents, AUTH_SERVICE_INITIALIZE } from "./AuthEvent";

export class MicrosoftLoginService {
  authInProgress = false;
  msGraphService = new MicrosoftGraphService();
  msToNativeLoginBridge = new MsToNativeLoginBridge();
  microsoftOauthLoginService = new MicrosoftOauthLoginService(this.msGraphService,this.msToNativeLoginBridge);
  teamsLoginService = new TeamsLoginService(this.msGraphService,this.msToNativeLoginBridge);
  private initialized: boolean = false;

  constructor() {
    this.onReady().then(()=>{
      this.initialized= true;
    });
  }

  async onReady(){
    if(this.initialized){
      return Promise.resolve(true);
    }else{
      return new Promise<boolean>((resolve) => {
        const onInitialized = () => {
          getAuthEvents().off(AUTH_SERVICE_INITIALIZE, onInitialized);
          resolve(true);
        };
        getAuthEvents().on(AUTH_SERVICE_INITIALIZE, onInitialized);
      })
    }
  }

  async passiveLogin() {
    if(!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(()=>{
        this.authInProgress = false;
      },1000);
        if(msTeams()){
          await this.teamsLoginService.passiveLogin();
          this.authInProgress = false;
        }else{
          await this.microsoftOauthLoginService.passiveLogin();
          this.authInProgress = false;
        }
        getAuthEvents().emit(AUTH_SERVICE_INITIALIZE);
    }
  }

  private async loginInternal(){
    if(!this.authInProgress) {
      this.authInProgress = true;
      setTimeout(()=>{
        this.authInProgress = false;
      },1000);
      if(msTeams()){
        await this.teamsLoginService.userInteractionAuth();
        this.authInProgress = false;
      }else{
        await this.microsoftOauthLoginService.login();
        this.authInProgress = false;
      }
    }
  }

  async login(nofail=true) {
    if(nofail) {
      try {
        return await this.loginInternal();
      }catch (e){
        this.authInProgress = false;
        //avoid any throw
        console.error(e);
      }
    }else{
      return await this.loginInternal();
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
      },1000);
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

  isSignedIn() {
    return this.msToNativeLoginBridge.isLogged();
  }
}

export const microsoftLoginService = new MicrosoftLoginService();

