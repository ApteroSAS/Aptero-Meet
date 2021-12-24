import uuid from "uuid/v4";
import { microsoftService } from "../aptero/service/MicrosoftIntegration/MicrosoftService";
import { microsoftLoginService } from "../aptero/service/MicrosoftIntegration/MicrosoftLoginService";

export default class AuthChannel {
  constructor(store) {
    this.store = store;
    this.socket = null;
    this._signedIn = !!this.store.state.credentials.token;
  }

  setSocket = socket => {
    this.socket = socket;
    //TODO aptero put in service
    //let user = microsoftLoginService.getUserAccount();
    //if (user) {
      //this.convertToHubToken(user).catch((err)=>{
        //console.error(err);
      //});
    //}
/*
    microsoftService.eventEmitter.on("auth", async () => {
      let user = microsoftService.getUserAccount();
      await this.convertToHubToken(user);
      window.location.reload();
    });
    this.syncMicrosoftAccount(null);
      */
  };


  get email() {
    //TODO aptero put in service
    return microsoftLoginService.getUserAccount().mail;
    //return (microsoftService.getUserAccount() && (microsoftService.getUserAccount().name+" (SSO)")) || this.store.state.credentials.email;
  }


  get signedIn() {
    return this._signedIn;
  }
  
  //TODO aptero put in service
  async syncMicrosoftAccount(hubChannel) {
    if (!microsoftService.getUserAccount()) {
      if (this.store.state.credentials.email && this.store.state.credentials.email.endsWith("_microsoft")) {
        //if microsoft account is logged off we log of the aptero account
        //console.log("sign out sync");
        await this.signOut(hubChannel);
        window.location.reload();
      }
    }else if(microsoftService.getUserAccount() && !this.store.state.credentials.email){
      // microsoft account logged propagate to hubs account
      let user = microsoftService.getUserAccount();
      await this.convertToHubToken(user);
      console.log("sync microsoft to hubs");
      window.location.reload();
    }
  }

  signOut = async hubChannel => {
    if (hubChannel) {
      await hubChannel.signOut();
    }
    this.store.update({ credentials: { token: null, email: null } });
    await this.store.resetToRandomDefaultAvatar();
    this._signedIn = false;
    await microsoftService.logout();//aptero
  };

  verifyAuthentication(authTopic, authToken, authPayload) {
    const channel = this.socket.channel(authTopic);
    return new Promise((resolve, reject) => {
      channel.onError(() => {
        channel.leave();
        reject();
      });

      channel
        .join()
        .receive("ok", () => {
          channel.on("auth_credentials", async ({ credentials: token, payload: payload }) => {
            await this.handleAuthCredentials(payload.email, token);
            resolve();
          });

          channel.push("auth_verified", { token: authToken, payload: authPayload });
        })
        .receive("error", reject);
    });
  }

  //TODO aptero put in service
  async convertToHubToken(user) {
    //const email = user.accountIdentifier + "_" + user.userName+ "_microsoft";
    var email="";
    var authtoken="";
    var displayName="";
    if(user!=null)
    {
      email=user.mail;
      authtoken=microsoftLoginService.getToken();
      displayName=user.displayName;
    }
    //const authtoken = user.idToken;
    await new Promise((resolve, reject) => {
      const channel = this.socket.channel(`auth:${uuid()}`);
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
              await this.handleProfile(payload.email, token);
              resolve();
            });
            channel.push("auth_verified", { token: auth_token, payload: auth_payload });
          });
          channel.push("auth_token_request", { email, authtoken, origin: "hubs" });
        }).receive("error", reject);
    });
  }

  async startAuthentication(email, hubChannel) {
    const channel = this.socket.channel(`auth:${uuid()}`);
    await new Promise((resolve, reject) =>
      channel
        .join()
        .receive("ok", resolve)
        .receive("error", reject)
    );
    //const token=microsoftLoginService.getToken();
    //console.log(token);
    //if(token!=null)
    //{
      //await this.handleAuthCredentials(email, token, hubChannel);
    //}
    //const auth_token=microsoftLoginService.getToken();
    //await this.handleAuthCredentials(email, auth_token, hubChannel);
    const authComplete = new Promise(resolve =>
      channel.on("auth_credentials", async ({ credentials: auth_token }) => {
        console.log("token is ",auth_token);
        await this.handleAuthCredentials(email, auth_token, hubChannel);
        resolve();
      })
    );
    channel.push("auth_request", { email, origin: "hubs" });
    // Returning an object with the authComplete promise since we want the caller to wait for the above await but not
    // for authComplete.
    return { authComplete };
  }
  async startMicrosoftAuthentication(user,hubChannel){
    const channel = this.socket.channel(`auth:${uuid()}`);
    var mail="";
    const user_=microsoftLoginService.getUserAccount();
    await new Promise((resolve, reject) =>
      channel
        .join()
        .receive("ok", resolve)
        .receive("error", reject)
    );
    const token=microsoftLoginService.getToken();
    if(token!=null)
    {
      await this.handleAuthCredentials(user_.mail, token, hubChannel);
    }
    console.log("channel",channel);
    //const auth_token=microsoftLoginService.getToken();
    //await this.handleAuthCredentials(email, auth_token, hubChannel);
    const authComplete = new Promise(resolve =>
      channel.on("auth_credentials", async ({ credentials: auth_token }) => {
        console.log("token is ",auth_token);
        //await this.handleAuthCredentials(email, auth_token, hubChannel);
        resolve();
      })
    );
    if(user_!=null)
    {
      mail=user_.mail;
    }
    //channel.push("auth_request", { mail, origin: "hubs" });
    // Returning an object with the authComplete promise since we want the caller to wait for the above await but not
    // for authComplete.
    return { authComplete };
  }

  async handleAuthCredentials(email, token, hubChannel) {
    this.store.update({ credentials: { email, token },
      profile :{
        microsoftUser:false
      }
    });
  
    if (hubChannel) {
      await hubChannel.signIn(token);
    }
    //console.log("store",this.store.profile);
    this._signedIn = true;
  }
  async handleProfile(email, token, hubChannel)
  {
    const user=microsoftLoginService.getUserAccount();
    const companyName=microsoftLoginService.getCompanyName();
    const profilePicture=microsoftLoginService.displayProfilePhoto();
    this.store.update({ credentials: { email, token }, profile: {
      email:email,
      displayName: user.displayName,
      phoneNumber:user.mobilePhone,
      jobTitle:user.jobTitle,
      companyName:companyName,
      profilePicture:profilePicture,
      microsoftUser:true,
    } ,activity :{hasChangedName:true,hasChangedPicture:true}});
  
    if (hubChannel) {
      await hubChannel.signIn(token);
    }
    //console.log("store",this.store.profile);
    this._signedIn = true;
  }
}