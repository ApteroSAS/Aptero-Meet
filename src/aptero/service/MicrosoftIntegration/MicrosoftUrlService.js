const EventEmitter = require("eventemitter3");
export const MICROSOFT_AUTH_ERROR = "error_microsoft_not_authorized";

export class MicrosoftUrlService{
  eventEmitter = new EventEmitter();
  preloaded = {};

  constructor(){}

  urlToToSharingToken(url) {
    let trimEnd = function(str, c) {
      c = c ? c : ' ';
      let i = str.length - 1;
      for (; i >= 0 && str.charAt(i) == c; i--);
      return str.substring(0, i + 1);
    };
    let value = Buffer.from(url).toString('base64');
    return "u!" + trimEnd(value, '=').replace(/\//g, '_').replace(/\+/g, '-');
  }

  async preFetchConvertMicrosoftUrl(url){
    return this.convertMicrosoftUrl(url);
  }

  convertMicrosoftUrlSync(url){
    this.preFetchConvertMicrosoftUrl(url);
    return this.preloaded[url] || url;
  }

  async convertMicrosoftUrl(url){
    if(url.indexOf("sharepoint.com")===-1){
      return url;
    }else {
      console.log("convertMicrosoftUrl")
      if(this.getUserAccount()) {
        let res = await this.convertSharingUrlToDownloadUrl(url);
        this.preloaded[url] = res;
        return res;
      }else{
        console.log("passiveLoginWithTeams")
        await this.passiveLogin();
        if(this.getUserAccount()) {
          let res = await this.convertSharingUrlToDownloadUrl(url);
          this.preloaded[url] = res;
          return res;
        }else{
          console.log("loginWithRedirect")
          await this.loginWithRedirect();
        }
      }
    }
  }

  async convertSharingUrlToDownloadUrl(url){
    return new Promise((resolve) => {
      const stoken = this.urlToToSharingToken(url);
      this.client.api('/shares/'+stoken+'/driveItem').get().then((res) => {
        resolve(res["@microsoft.graph.downloadUrl"]);
      }).catch((err)=>{
        console.warn(err);
        //reject(err);
        resolve(MICROSOFT_AUTH_ERROR);
      });
    });
  }

  processLogged(response){
    this.acessToken = response.accessToken;
    this.eventEmitter.emit("auth",this.getUserAccount());
    console.log("processLogged :",this.getUserAccount())
    const url = "https://graph.microsoft.com/v1.0/me";
    this.client.api(url).get().then((res) => {
      console.log(res);
    }).catch((err)=>{
      console.error(err)
    });
  }

  handleError(error) {
    if (error.errorCode === 'consent_required'
      || error.errorCode === 'interaction_required'
      || error.errorCode === 'login_required') {
      this.loginWithRedirect();
      return;
    }
    console.warn(error);
  }

}

export const microsoftUrlService = new MicrosoftUrlService();
