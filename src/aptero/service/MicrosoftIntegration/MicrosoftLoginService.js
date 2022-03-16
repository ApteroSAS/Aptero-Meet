import { PublicClientApplication } from "@azure/msal-browser";
import { Component } from "react";
import configs from "../../../utils/configs";
import uuid from "uuid/v4";
import AuthChannel from "../../../utils/auth-channel";
import { connectToReticulum } from "../../../utils/phoenix-utils";
import { msTeams, msTeamsWaitInit, requestAuthToken, requestUserInfo } from "./MsTeams";
import { MicrosoftGraphService } from "./MicrosoftGraphService";

export function getScopes(){
  return [
    "user.read",
    "profile"
  ];
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

  async passiveLogin() {
    //if msteams
    // log using token from msteams
    //if cookie oauth microsoft
    if(msTeams()){
      const msMeetInit = () => {
        requestAuthToken((accessToken)=>{
          this.init(accessToken.token);
          this.nativeLogin();
        });
        requestUserInfo((data)=>{
          this.initBasic(data);
          this.nativeLogin();
        })
      };
      msTeamsWaitInit().then(() => {
        //in case of passive login before ms bridge established
        msMeetInit();
      });
      //in case of passive login after ms bridge established
      msMeetInit();
    }
    if (window.APP.store.state.profile.microsoftUser && !this.accessToken) {
      try {
        //  try silent login
        const account = this.publicClientApplication.getAllAccounts()[0];
        const accessTokenRequest = {
          scopes: getScopes(),
          account: account
        };
        let authenticationResult = await this.publicClientApplication.acquireTokenSilent(accessTokenRequest);
        this.init(authenticationResult.accessToken);
        await this.nativeLogin();
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
          }, activity: { hasChangedName: false, hasChangedPicture: false }
        });
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

  async init(token) {
    console.log("microsoft login token:" + token);
    this.accessToken = token;
    this.msGraphService.setToken(this.accessToken);
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
      let response = await this.publicClientApplication.loginPopup();
      await this.init(response.accessToken);
    } catch (error) {
      console.log("error", error);
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
      if(this.accessToken) {
        return this.publicClientApplication.logoutPopup();
      }
    }
  }

  displayProfilePhoto() {
    return this.profilePicture ? "data:image/jpeg;base64," + this.profilePicture : null;
  }
}

export const microsoftLoginService = new MicrosoftLoginService();

