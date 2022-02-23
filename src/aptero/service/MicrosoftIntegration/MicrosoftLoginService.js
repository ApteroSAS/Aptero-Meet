
import {PublicClientApplication,InteractionType, AccountInfo} from "@azure/msal-browser";
import {Msal} from "msal";
import { React ,Component ,setState} from 'react';
import { ThemeConsumer } from "styled-components";
import { getUserDetails,getUserDetailsBetaV,getUserorganization,getUserPhoto} from "./MicrosofGraphService";
import { config } from "./Config";
import PropTypes from "prop-types";
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
export class  MicrosoftLoginService extends Component {
  user=null;
  response=null;
  organization=null;
  accessToken=null;
  profilePicture="";
  account_type=null;
  constructor(props){
    super(props);
    /*
    this.state={
      error:null,
      isAuthtenticated:false,
      user:{},
     
    };*/
    this.PublicClientApplication=new PublicClientApplication({
      auth:{
        clientId:'caafb04c-8c13-4044-92a4-3648f79dc7e3',
        redirectUrl:'https://localhost/signin',
        // to allow only AAD accounts: authority:https://login.microsoftonline.com/organizations 
        authority:'https://login.microsoftonline.com/common',
        scopes:[
            'user.read',
            'profile'
          ]
      },
      cache:{
        cacheLocation:"sessionStorage",
        storeAuthStateInCookie:true
      }
    });
    /*
    static PropTypes={
        response:PropTypes.object
    };*/
    
    //this.login=this.login.bind(this);

    
    
  }
 
  
  
 async login(){
   
  try{
    let resp = await this.PublicClientApplication.loginPopup();
    this.response=resp;
    this.accessToken=this.response.accessToken;
    const user= await getUserDetails(this.accessToken);
    this.user=user;
    const user_beta=await getUserDetailsBetaV(this.accessToken);
    const account_type=user_beta.account[0].source.type[0];
    this.account_type=account_type;
    const organization=await getUserorganization(this.accessToken,this.account_type);
    this.organization=organization;
    this.profilePicture="";
    this.profilePicture=await getUserPhoto(this.accessToken); 
  }
  catch(error){
    console.log("error",error);
  }
  

}
 getToken()
{
  return this.response.accessToken;
}
 getUserAccount()
{
  
 return this.user;
}
getCompanyName()
{
  if(this.organization)
  {
    return this.organization;
  }
  return null;
 
}
getName()
{
  
  if(this.user!=null)
  {
    
    return this.user.displayName;
  }
  return null;
 
}
getAccounType()
{
  return this.account_type;
}


async logout(){
  return new Promise((resolve, reject) => {
    //if(this.PublicClientApplication && this.user) {
      this.PublicClientApplication.logoutPopup().then(response => {
        resolve(response);
      }).catch(err => {
        reject(err);
      });
    //}
    /*else{
      resolve("already");
    }
    */
  });
}
 displayProfilePhoto() {    
  if(this.profilePicture)
  {
    const userPhoto='data:image/jpeg;base64,'+this.profilePicture
    return userPhoto ; 
  }
  else{
    return null;
  }

} 
}
export   const microsoftLoginService= new MicrosoftLoginService();

