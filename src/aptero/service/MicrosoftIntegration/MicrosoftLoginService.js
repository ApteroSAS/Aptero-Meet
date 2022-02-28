import { PublicClientApplication } from "@azure/msal-browser";
import { Component } from "react";
import { getUserDetails, getUserDetailsBetaV, getUserOrganization, getUserPhoto } from "./MicrosofGraphService";
import configs from "../../../utils/configs";
import uuid from "uuid/v4";
import AuthChannel from "../../../utils/auth-channel";
import { connectToReticulum } from "../../../utils/phoenix-utils";

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

  async passiveLogin(onLogOutRequest) {
    //if msteams
    // log using token from msteams
    //if cookie oauth microsoft
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
        onLogOutRequest();
      }
    }
  }

  async init(token) {
    console.log("microsoft login toke:" + token);
    this.accessToken = token;
    this.user = await getUserDetails(this.accessToken);
    const user_beta = await getUserDetailsBetaV(this.accessToken);
    this.account_type = user_beta.account[0].source.type[0];
    this.organization = await getUserOrganization(this.accessToken, this.account_type);
    this.profilePicture = "";
    this.profilePicture = await getUserPhoto(this.accessToken);

    const user = this.getUserAccount();
    const companyName = this.getCompanyName();
    const profilePicture = this.displayProfilePhoto();
    window.APP.store.update({
      profile: {
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.mobilePhone,
        jobTitle: user.jobTitle,
        companyName: companyName,
        microsoftUserprofilePicture: profilePicture,
        microsoftUser: true
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

  getCompanyName() {
    if (this.organization) {
      return this.organization;
    }
    return null;
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

    let user = this.getUserAccount();
    //const email = user.accountIdentifier + "_" + user.userName+ "_microsoft";
    let email = "";
    let authtoken = "";
    let account_type = "";
    if (user != null) {
      authtoken = this.getToken();
      account_type = this.getAccounType();
      if (account_type === "MSA") {
        email = user.userPrincipalName;
      } else {
        email = user.mail;
      }
    }
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
          channel.push("auth_token_request", { email, authtoken, origin: "hubs" });
        }).receive("error", reject);
    });
  }

  async handleProfile(email, token, hubChannel) {
    const user = this.getUserAccount();
    const companyName = this.getCompanyName();
    const profilePicture = this.displayProfilePhoto();
    window.APP.store.update({
      credentials: { email, token }, profile: {
        email: email,
        displayName: user.displayName,
        phoneNumber: user.mobilePhone,
        jobTitle: user.jobTitle,
        companyName: companyName,
        microsoftUserprofilePicture: profilePicture,
        microsoftUser: true
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
          microsoftUser: false
        }, activity: { hasChangedName: false, hasChangedPicture: false }
      });
      return this.publicClientApplication.logoutPopup();
    }
  }

  displayProfilePhoto() {
    return this.profilePicture ? "data:image/jpeg;base64," + this.profilePicture : null;
  }
}

export const microsoftLoginService = new MicrosoftLoginService();

