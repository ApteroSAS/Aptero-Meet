import configs from "../../../utils/configs";
import { AUTH_TOKEN , msTeams, sendAuthToken } from "./MsTeams";
import { Providers, ProviderState } from "@microsoft/mgt-react";
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import {
  loadConfiguration,
  TeamsUserCredential,
  ResourceType,
  LogLevel,
  setLogLevel,
  setLogFunction, createMicrosoftGraphClient
} from "@microsoft/teamsfx";
import * as microsoftTeams from "@microsoft/teams-js";
import { getAuthEvents, LOGGED_BASIC_INFO } from "./AuthEvent";
import { getScopes } from "./scope";

let credential;
export const startLoginPageUrl = window.location.origin + "/auth-start.html";
export const functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
export const clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;

function initTeamsFx(authorityHost) {
  /*loadConfiguration({
      authentication: {
          initiateLoginEndpoint: process.env.REACT_APP_START_LOGIN_PAGE_URL,
          clientId: process.env.REACT_APP_CLIENT_ID
      }
  });*/
  /*if (process.env.NODE_ENV === "development") {
      setLogLevel(LogLevel.Verbose);
      setLogFunction((leve: LogLevel, message: string) => { console.log(message); });
  }*/
  if (process.env.NODE_ENV === "development") {
    setLogLevel(LogLevel.Warn);
    setLogFunction((leve, message) => {
      console.warn(message);
    });
  }
  loadConfiguration({
    authentication: {
      authorityHost,
      initiateLoginEndpoint: startLoginPageUrl,
      //simpleAuthEndpoint: teamsfxEndpoint,//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template
      clientId: clientId
    },
    resources: [
      {
        type: ResourceType.API,
        name: "default",
        properties: {
          endpoint: functionEndpoint
        }
      }
    ]
  });
  credential = new TeamsUserCredential();
}

export function getCredential() {
  if (!credential) {
    initTeamsFx("common");
  }
  if (!credential) {
    throw new Error("");
  }
  return credential;
}

export class TeamsLoginService {

  constructor(microsoftGraphService, msToNativeLoginBridge) {
    this.microsoftGraphService = microsoftGraphService;
    this.msToNativeLoginBridge = msToNativeLoginBridge;
  }

  async initBasicInfo() {
    const cred = getCredential();
    await cred.getUserInfo();
    getAuthEvents().emit(LOGGED_BASIC_INFO);
    return cred;
  }

  initTeamsFxProvider(credential, scope) {
    const provider = new TeamsFxProvider(credential, scope);
    Providers.globalProvider = provider;
  }

  async initGraph(){
    try {
      const token = await credential?.getToken(getScopes());
      const graph = createMicrosoftGraphClient(credential, getScopes());
      this.microsoftGraphService.init(graph,token);
    }catch (e) {
      console.error(e);
    }
  }

  async userInteractionAuth(consentNeeded) {
    //To test and revok application auth => https://myapplications.microsoft.com/
    console.log("userInteractionAuth");
    const cred = await this.initBasicInfo();
    cred.login(getScopes());
    //await teamsAuth();
    await this.initGraph();
    await this.initTeamsFxProvider(cred, getScopes());
    const userInfo = await cred.getUserInfo();
    await this.initBasic(userInfo);
    await this.checkIsConsentNeeded(consentNeeded);
    return cred;
  }

  async passiveLogin() {
    //if msteams
    // log using token from msteams
    //if cookie oauth microsoft
    if (msTeams()) {
      // Initialize the Microsoft Teams SDK
      await microsoftTeams.initialize();
      try {
        const cred = await this.initBasicInfo();
        await this.initTeamsFxProvider(cred, getScopes());
        const userInfo = await cred.getUserInfo();
        console.log("passiveAuth (basic):", cred);
        await this.initGraph();
        await this.initBasic(userInfo);
        Providers.globalProvider.setState(ProviderState.SignedIn);
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  }

  async initBasic(basicUserInfo) {
    if (this.msToNativeLoginBridge.getProfile().microsoftUser &&
      window.APP.store.state.credentials.token &&
      this.msToNativeLoginBridge.getProfile().displayName
    ) {
      return;
    }
    console.log("initBasic : ", basicUserInfo);
    //in this case we login without a graph token
    //only this data available {"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
    const user = {};
    user.email = basicUserInfo.preferredUserName;
    user.displayName = basicUserInfo.displayName;
    user.id = basicUserInfo.objectId;


    let profilePicture = "";
    let organization = "";
    let phoneNumber = "";
    let jobTitle = "";
    try {
      const user = await this.microsoftGraphService.getUserDetails();
      phoneNumber= user.mobilePhone;
      jobTitle= user.jobTitle;
      profilePicture = await this.microsoftGraphService.getUserPhoto();
      organization = await this.microsoftGraphService.getUserOrganization();
    } catch (e) {
      //ignore error from beta organisation
      console.error(e);
    }
    const cred = await this.initBasicInfo();
    let token = cred.ssoToken.token;
    try {
      token = await credential?.getToken(getScopes());
    }catch (e) {
      //ignore
    }
    await this.msToNativeLoginBridge.nativeLogin({
      email: user.email,
      displayName: user.displayName,
      phoneNumber: phoneNumber,
      jobTitle: jobTitle,
      companyName: organization,
      microsoftUserprofilePicture: profilePicture,
      microsoftUser: user.id
    },token);
  }

  async login() {
    try {
      this.userInteractionAuth(() => {
        console.warn("consent is needed");
      });
    } catch (error) {
      console.log("error", error);
    }

  }

  async checkIsConsentNeeded(consentNeeded) {
    try {
      const token = await credential?.getToken(getScopes());
      Providers.globalProvider.setState(ProviderState.SignedIn);
      getAuthEvents().emit(AUTH_TOKEN, { token: token });
      sendAuthToken({ token: token });
    } catch (error) {
      Providers.globalProvider.setState(ProviderState.SignedOut);
      consentNeeded();
    }
  }

  async logout() {
    this.msToNativeLoginBridge.clearProfile();
    if (Providers.globalProvider.state === ProviderState.SignedIn) {
      if (Providers.globalProvider && Providers.globalProvider.logout) {
        await Providers.globalProvider.logout();
      }
      Providers.globalProvider.setState(ProviderState.SignedOut);
      //meetVsTeamsBridge.sendIframeMessage(RELOAD);//Commented this because I suspect it cause a reload loop
    }
  }

}

