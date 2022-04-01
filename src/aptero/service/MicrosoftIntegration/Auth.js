import { Providers, ProviderState } from '@microsoft/mgt-react';
import { TeamsFxProvider } from "@microsoft/mgt-teamsfx-provider";
import { loadConfiguration, TeamsUserCredential, ResourceType, LogLevel, setLogLevel, setLogFunction } from "@microsoft/teamsfx";
import { AUTH_TOKEN, meetVsTeamsBridge, REQUEST_AUTH_TOKEN, REQUEST_USER_INFO, USER_INFO } from './MeetVsTeamsBridge';
import EventEmitter from "eventemitter3";
import configs from "../../../utils/configs";

//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template

let credential; //Due to the limitation of msal, multiple instances of TeamsUserCredential is not recommended.
let startLoginPageUrl = window.location.origin;
let functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
let clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;

export const LOGGED_BASIC_INFO = "ms-auth-basic-info";
export const TOKEN_RECEIVED = "ms-auth-basic-info";
let events = new EventEmitter();
let passiveAuthInProgress = false;

export function getAuthEvents(){
    return events;
}

export function getCredential() {
    if (!credential) {
        // eslint-disable-next-line no-use-before-define
        initTeamsFx("common");
    }
    if (!credential) {
        throw new Error("");
    }
    return credential;
}

export function getScopes() {
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

/*
const credential = new TeamsUserCredential(); 
const user = await credential.getUserInfo();
{"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
*/

export function lisenToAuthTokenrequest() {
    meetVsTeamsBridge.eventListener.on(REQUEST_USER_INFO, async () => {
        try {
            const user = await getCredential().getUserInfo();
            meetVsTeamsBridge.sendIframeMessage(USER_INFO, user);        
        } catch (e) {
            console.error(e);
        }
    });
    meetVsTeamsBridge.eventListener.on(REQUEST_AUTH_TOKEN, async () => {
        try {
            // eslint-disable-next-line no-use-before-define
            await passiveAuth();
            const token = getCredential();
            meetVsTeamsBridge.sendIframeMessage(AUTH_TOKEN, { token: await token.getToken(getScopes()) })
        } catch (e) {
            console.error(e);
        }
    });
}

export async function passiveAuth() {
    if(!passiveAuthInProgress){
        passiveAuthInProgress = true;
        try{
            console.log("passiveAuth");
            // eslint-disable-next-line no-use-before-define
            const cred = await initBasicInfo();
            // eslint-disable-next-line no-use-before-define
            await initGraphToolkit(cred, getScopes());
            Providers.globalProvider.setState(ProviderState.SignedIn);
            passiveAuthInProgress = false;
            return passiveAuthInProgress;
        }catch (e) {
            passiveAuthInProgress = false;
            throw e;
        }
    }
    return passiveAuthInProgress;
}

export async function userInteractionAuth(consentNeeded) {
    //To test and revok application auth => https://myapplications.microsoft.com/
    console.log("userInteractionAuth");
    // eslint-disable-next-line no-use-before-define
    const cred = await initBasicInfo();
    //await teamsAuth();
    // eslint-disable-next-line no-use-before-define
    await initGraphToolkit(cred, getScopes());
    // eslint-disable-next-line no-use-before-define
    await checkIsConsentNeeded(consentNeeded);
    return cred;
}

export async function logout() {
    if (Providers.globalProvider.state === ProviderState.SignedIn) {
        if (Providers.globalProvider && Providers.globalProvider.logout) {
            await Providers.globalProvider.logout();
        }
        Providers.globalProvider.setState(ProviderState.SignedOut);
        //meetVsTeamsBridge.sendIframeMessage(RELOAD);//Commented this because I suspect it cause a reload loop
    }
}

async function initBasicInfo() {
    const cred = getCredential();
    const user = await cred.getUserInfo();
    events.emit(LOGGED_BASIC_INFO)
    meetVsTeamsBridge.sendIframeMessage(USER_INFO, user);    
    return cred;
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

function initGraphToolkit(credential, scope) {
    const provider = new TeamsFxProvider(credential, scope)
    Providers.globalProvider = provider;
}

async function checkIsConsentNeeded(consentNeeded) {
    try {
        const token = await credential?.getToken(getScopes());
        Providers.globalProvider.setState(ProviderState.SignedIn);
        events.emit(AUTH_TOKEN);
        meetVsTeamsBridge.sendIframeMessage(AUTH_TOKEN, { token: token});
    } catch (error) {
        Providers.globalProvider.setState(ProviderState.SignedOut);
        consentNeeded();
    }
}