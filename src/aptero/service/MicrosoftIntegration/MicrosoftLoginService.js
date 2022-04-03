import { PublicClientApplication } from "@azure/msal-browser";
import { Component } from "react";
import configs from "../../../utils/configs";
import uuid from "uuid/v4";
import AuthChannel from "../../../utils/auth-channel";
import { connectToReticulum } from "../../../utils/phoenix-utils";
import {AUTH_TOKEN, getMSEvents, msTeams, sendAuthToken} from "./MsTeams";
import { MicrosoftGraphService } from "./MicrosoftGraphService";
import { Providers, ProviderState } from '@microsoft/mgt-react';
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { loadConfiguration, TeamsUserCredential, ResourceType, LogLevel, setLogLevel, setLogFunction } from "@microsoft/teamsfx";
import EventEmitter from "eventemitter3";
import * as microsoftTeams from "@microsoft/teams-js";

let credential;
const startLoginPageUrl = window.location.origin;
const functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
const clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;
export const LOGGED_BASIC_INFO = "ms-auth-basic-info";
export const TOKEN_RECEIVED = "ms-auth-basic-info";
let passiveAuthInProgress = false;
let events = new EventEmitter();

export function getAuthEvents(){
  return events;
}

export function getScopes(){
  //const neededScopes = MgtPersonCard.getScopes();
  //must be the same as permision.json
  //import perm from "../../../../permissions.json"
  //return perm[0].delegated;
  //Try to avoid admin consent for authorization
  return [
    // Teams app permission
    "Contacts.Read", //use for visit card
    "Presence.Read.All", //use for visit card
    "User.ReadBasic.All", // Use for basic email, call and chat call to action, Avatar image and name - Mandatory
    "People.Read", //use for visit card
    //Permission for the web part
    "profile",//Avatar image and name - Mandatory
    "openid",//Avatar image and name - Mandatory
    "Files.Read",//Use to add content in the 3d space (pdf, img, mp4 etc...)
    "Files.Read.All"//Use to add content in the 3d space (pdf, img, mp4 etc...)
  ]
}

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
    setLogFunction((leve, message) => { console.warn(message); });
  }
  loadConfiguration({
    authentication: {
      authorityHost,
      initiateLoginEndpoint: startLoginPageUrl,
      //simpleAuthEndpoint: teamsfxEndpoint,//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template
      clientId: clientId,
    },
    resources: [
      {
        type: ResourceType.API,
        name: "default",
        properties: {
          endpoint: functionEndpoint,
        },
      },
    ],
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

export class MicrosoftLoginService extends Component {
  user = null;
  organization = null;
  accessToken = null;
  profilePicture = "";
  account_type = null;
  msGraphService = new MicrosoftGraphService();

  constructor(props) {
    super(props);
  }

  getPublicClientApplication(){
    if(!this.publicClientApplication){
      this.publicClientApplication = new PublicClientApplication({
        auth: {
          clientId: configs.APP_CONFIG.MICROSOFT_APP_ID,
          redirectUrl: window.location.origin + "/signin",
          // to allow only AAD accounts: authority:https://login.microsoftonline.com/organizations
          authority: configs.APP_CONFIG.MICROSOFT_APP_AUTHORITY || "https://login.microsoftonline.com/common",
          scopes: getScopes()
        },
        cache: {
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: true
        }
      });
    }
    return this.publicClientApplication;
  }

  async initBasicInfo() {
    const cred = getCredential();
    await cred.getUserInfo();
    events.emit(LOGGED_BASIC_INFO)
    return cred;
  }

  initTeamsFxProvider(credential, scope) {
    const provider = new TeamsFxProvider(credential, scope)
    Providers.globalProvider = provider;
  }

  async passiveLogin() {
    if(!passiveAuthInProgress) {
      passiveAuthInProgress = true;
      setTimeout(()=>{
        passiveAuthInProgress = false;
      },20000)
      //if msteams
      // log using token from msteams
      //if cookie oauth microsoft
      if (msTeams()) {
        // Initialize the Microsoft Teams SDK
        microsoftTeams.initialize();
        getMSEvents().on(AUTH_TOKEN, data => {
          if(this.accessToken === data.token){
            return; // no new information so ignore
          }
          if (this.accessToken) {
            this.setNewToken(data.token);
          } else {
            this.initWithToken(data.token);
            this.nativeLogin();
          }
        });
        try{
          const cred = await this.initBasicInfo();
          await this.initTeamsFxProvider(cred, getScopes());
          Providers.globalProvider.setState(ProviderState.SignedIn);
          console.log("passiveAuth",cred);
          this.initBasic(await cred.getUserInfo());
          this.nativeLogin();
          passiveAuthInProgress = false;
        }catch (e) {
          console.error(e);
          passiveAuthInProgress = false;
          throw e;
        }
      } else if (window.APP.store.state.profile.microsoftUser && !this.accessToken) {
        try {
          //  try silent login
          const account = this.getPublicClientApplication().getAllAccounts()[0];
          const accessTokenRequest = {
            scopes: getScopes(),
            account: account
          };
          let authenticationResult = await this.getPublicClientApplication().acquireTokenSilent(accessTokenRequest);
          this.initWithToken(authenticationResult.accessToken);
          await this.nativeLogin();
          passiveAuthInProgress = false;
        } catch (err) {
          console.error(err);
          // logout Moz to be sync
          //this.store.state.profile.microsoftUser = false; //will be done by the logout/signout
          this.accessToken = null;//passive clean of acces token
          window.APP.store.update({
            profile: {
              phoneNumber: null,
              jobTitle: null,
              companyName: null,
              microsoftUserprofilePicture: null,
              microsoftUser: null
            }, activity: {hasChangedName: false, hasChangedPicture: false}
          });
          passiveAuthInProgress = false;
        }
      }
    }
  }

  async initBasic(basicUserInfo) {
    if(this.accessToken){
      return; //if we have an access token that means we are fully authenticated
    }
    //in this case we login without a graph token
    //only this data available {"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
    this.user = {};
    this.user.email = basicUserInfo.preferredUserName;
    this.user.displayName = basicUserInfo.displayName;
    this.user.id = basicUserInfo.objectId;
    window.APP.store.update({
      profile: {
        email: this.user.email,
        displayName: this.user.displayName,
        phoneNumber: null,
        jobTitle: null,
        companyName: null,
        microsoftUserprofilePicture: null,
        microsoftUser: this.user.id
      }, activity: { hasChangedName: true, hasChangedPicture: true }
    });
  }

  setNewToken(token){
    console.log("microsoft login token:" + token);
    this.accessToken = token;
    this.msGraphService.setToken(this.accessToken);
  }

  async initWithToken(token) {
    this.setNewToken(token);
    this.user = await this.msGraphService.getUserDetails();
    this.profilePicture = "";
    this.organization = "";
    try {
      this.profilePicture = await this.msGraphService.getUserPhoto();
      const user_beta = await this.msGraphService.getUserDetailsBetaV();
      this.account_type = user_beta.account[0].source.type[0];
      this.organization = await this.msGraphService.getUserOrganization(this.account_type);
    }catch (e) {
      //ignore error from beta organisation
      console.error(e);
    }

    const user = this.getUserAccount();
    window.APP.store.update({
      profile: {
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.mobilePhone,
        jobTitle: user.jobTitle,
        companyName: this.organization,
        microsoftUserprofilePicture: this.profilePicture,
        microsoftUser: user.id
      }, activity: { hasChangedName: true, hasChangedPicture: true }
    });
  }

  async login() {
    try {
      if(msTeams()){
        this.userInteractionAuth();
      }else {
        let response = await this.getPublicClientApplication().loginPopup();
        await this.initWithToken(response.accessToken);
      }
    } catch (error) {
      console.log("error", error);
    }

  }

  async userInteractionAuth(consentNeeded) {
    //To test and revok application auth => https://myapplications.microsoft.com/
    console.log("userInteractionAuth");
    const cred = await this.initBasicInfo();
    //await teamsAuth();
    await this.initTeamsFxProvider(cred, getScopes());
    await this.checkIsConsentNeeded(consentNeeded);
    return cred;
  }

  async checkIsConsentNeeded(consentNeeded) {
    try {
      const token = await credential?.getToken(getScopes());
      Providers.globalProvider.setState(ProviderState.SignedIn);
      events.emit(AUTH_TOKEN,{ token: token});
      sendAuthToken({ token: token});
    } catch (error) {
      Providers.globalProvider.setState(ProviderState.SignedOut);
      consentNeeded();
    }
  }

  getToken() {
    return this.accessToken;
  }

  getUserAccount() {
    return this.user;
  }

  getName() {
    if (this.user != null) {
      return this.user.displayName;
    }
    return null;
  }

  getAccounType() {
    return this.account_type;
  }

  async nativeLogin() {
    if(window.APP.store.state.credentials.token){
      return;
    }
    const hubChannel=new AuthChannel(window.APP.store);
    const socket = await connectToReticulum();
    hubChannel.setSocket(socket);

    //const email = user.accountIdentifier + "_" + user.userName+ "_microsoft";
    await new Promise((resolve, reject) => {
      const channel = hubChannel.socket.channel(`auth:${uuid()}`);
      channel.onError(() => {
        channel.leave();
        reject();
      });
      channel
        .join()
        .receive("ok", () => {
          channel.on("auth_token_resp", async ({
                                                 auth_token: auth_token,
                                                 auth_payload: auth_payload
                                               }) => {
            channel.on("auth_credentials", async ({ credentials: token, payload: payload }) => {
              await this.handleProfile(payload.email, token, hubChannel);
              resolve();
            });
            channel.push("auth_verified", { token: auth_token, payload: auth_payload });
          });
          let email = "";
          let user = this.user;
          if (this.getAccounType() === "MSA") {
            email = user.userPrincipalName;
          } else {
            email = user.mail || user.email;
          }
          channel.push("auth_token_request", { email, authtoken:this.accessToken?this.accessToken:this.user.id, origin: "hubs" });
        }).receive("error", reject);
    });
  }

  async handleProfile(email, token, hubChannel) {
    const user = this.getUserAccount();
    const companyName = this.organization;
    const profilePicture = this.displayProfilePhoto();
    window.APP.store.update({
      credentials: { email, token }, profile: {
        email: email,
        displayName: user.displayName,
        phoneNumber: user.mobilePhone,
        jobTitle: user.jobTitle,
        companyName: companyName,
        microsoftUserprofilePicture: profilePicture,
        microsoftUser: user.id
      }, activity: { hasChangedName: true, hasChangedPicture: true }
    });

    hubChannel._signedIn = true;
  }

  async logout() {
    if (window.APP.store.state.profile.microsoftUser) {
      window.APP.store.update({
        profile: {
          email: null,
          phoneNumber: null,
          jobTitle: null,
          companyName: null,
          microsoftUserprofilePicture: null,
          microsoftUser: null
        }, activity: { hasChangedName: false, hasChangedPicture: false }
      });
      if(this.publicClientApplication) {
        return this.getPublicClientApplication().logoutPopup();
      }
    }
    if (Providers.globalProvider.state === ProviderState.SignedIn) {
      if (Providers.globalProvider && Providers.globalProvider.logout) {
        await Providers.globalProvider.logout();
      }
      Providers.globalProvider.setState(ProviderState.SignedOut);
      //meetVsTeamsBridge.sendIframeMessage(RELOAD);//Commented this because I suspect it cause a reload loop
    }
  }

  displayProfilePhoto() {
    return this.profilePicture ? "data:image/jpeg;base64," + this.profilePicture : null;
  }
}

export const microsoftLoginService = new MicrosoftLoginService();

