
import {PublicClientApplication,InteractionType, AccountInfo} from "@azure/msal-browser";
import {Msal} from "msal";
import { React ,Component ,setState} from 'react';
import { ThemeConsumer } from "styled-components";
import { getUserDetails,getUserorganization,getUserPhoto } from "./MicrosofGraphService";
import { config } from "./Config";
import PropTypes from "prop-types";
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
export class  MicrosoftLoginService extends Component {
  user=null;
  response=null;
  organization=null;
  accessToken=null;
  profilePicture="";
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
   /*
    this.PublicClientApplication.loginPopup().then(async (resp)=>{
        this.response=resp;
        const user= await getUserDetails(resp.accessToken);
        this.user=user;
        //console.log(this.user);
        //console.log(this.user);
        //return user;
        //console.log(user);        
    })
      .catch((err) => {
        console.error(err);
      });*/
      
    //this.setState({isAuthtenticated:true})
  
    let resp = await this.PublicClientApplication.loginPopup();
    this.response=resp;
    this.accessToken=this.response.accessToken;
    const user= await getUserDetails(this.accessToken);
    this.user=user;
    const organization=await getUserorganization(this.accessToken);
    this.organization=organization;
    this.profilePicture=await getUserPhoto(this.accessToken); 
    //this.displayProfilePhoto();

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
  return this.organization;
}
getName()
{
  
  if(this.user!=null)
  {
    
    return this.user.displayName;
  }
  return null;
 
}


async logout(){
}
 displayProfilePhoto() {    
  //const userPhoto = await getUserPhoto(this.accessToken); 
  //if (!userPhoto) {  
      //return;  
       

  //convert blob to a local URL
  //const urlObject = URL.createObjectURL(userPhoto); 
  //console.log("image",urlObject);
  // show user photo  
  //const userPhotoElement = document.getElementById('userPhoto'); 
  //userPhotoElement.src = urlObject; 
  const userPhoto='data:image/jpeg;base64,'+this.profilePicture
  return userPhoto ; 
} 
}
export   const microsoftLoginService= new MicrosoftLoginService();

