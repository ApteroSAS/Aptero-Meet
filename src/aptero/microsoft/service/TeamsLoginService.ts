import configs from "../../../utils/configs";
import {AUTH_TOKEN, msTeams, sendAuthToken} from "./MsTeams";
import {Providers, ProviderState} from "@microsoft/mgt-react";
import {TeamsFxProvider} from "@microsoft/mgt-teamsfx-provider";
import {
    loadConfiguration,
    TeamsUserCredential,
    ResourceType,
    LogLevel,
    setLogLevel,
    setLogFunction, createMicrosoftGraphClient
} from "@microsoft/teamsfx";
import * as microsoftTeams from "@microsoft/teams-js";
import {getAuthEvents, LOGGED_BASIC_INFO} from "./AuthEvent";
import { getScopes, getScopesLight } from "./scope";
import {MicrosoftGraphService} from "./MicrosoftGraphService";
import {MsToNativeLoginBridge} from "./MsToNativeLoginBridge";

let credential;
export const startLoginPageUrl = window.location.origin + "/auth-start.html";
export const functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
export const clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;

declare const window;
//To test and revoke application auth
// https://myapplications.microsoft.com/
// https://portal.office.com/account/?ref=MeControl#apps

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

    constructor(private microsoftGraphService:MicrosoftGraphService, private msToNativeLoginBridge:MsToNativeLoginBridge) {}

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

    async initGraph(scopes) {
        try {
            const graph = createMicrosoftGraphClient(credential, scopes);
            const token = await credential?.getToken(scopes);
            this.microsoftGraphService.init(graph, token);
        } catch (e) {
            if (e.toString().indexOf("please login first") !== -1) {
                console.info("app not authorized - no graph support")
            } else {
                console.error(e);
            }
        }
    }

    async userInteractionAuth() {
        console.log("userInteractionAuth");
        const cred = await this.initBasicInfo();
        await this.initTeamsFxProvider(cred, getScopesLight());
        await new Promise(async (resolve, reject) => {
            await this.checkIsConsentNeeded(()=>{
                cred.login(getScopesLight());//Trigger authorization popup
                resolve(true);
            });
        })
        //await teamsAuth();
        await this.initGraph(getScopesLight());
        const userInfo = await cred.getUserInfo();
        await this.initBasic(userInfo, true);
        Providers.globalProvider.setState(ProviderState.SignedIn);
        return cred;
    }

    async upgrade(){
        console.log("upgrade");
        let scope = getScopes();
        const cred = await this.initBasicInfo();
        await this.initTeamsFxProvider(cred, scope);
        await new Promise(async (resolve, reject) => {
            await this.checkIsConsentNeeded(()=>{
                cred.login(scope);//Trigger authorization popup
                resolve(true);
            });
        })
        //await teamsAuth();
        await this.initGraph(scope);
        const userInfo = await cred.getUserInfo();
        await this.initBasic(userInfo, true);
        return cred;
    }

    async passiveLogin() {
        if(!msTeams()){
            throw new Error("not in teams");
        }
        try {
            await microsoftTeams.initialize();
        } catch (e) {
            console.warn("microsoftTeams.initialize failed (probably not in teams so we skip it)", e);
        }
        if(!this.msToNativeLoginBridge.isLogged()){
            return;
        }
        try {
            //if msteams
            // log using token from msteams
            //if cookie oauth microsoft
            // Initialize the Microsoft Teams SDK
            const cred = await this.initBasicInfo();
            await this.initTeamsFxProvider(cred, getScopesLight());
            const userInfo = await cred.getUserInfo();
            console.log("passiveAuth (basic):", cred);
            await this.initGraph(getScopesLight());
            await this.initBasic(userInfo, false);
            Providers.globalProvider.setState(ProviderState.SignedIn);
        } catch (e) {
            //passive login should never fail - just ignore
            console.warn("passive login failed", e);
        }
    }

    isUserBasicLogged() {
        return this.msToNativeLoginBridge.getProfile().microsoftUser &&
            this.msToNativeLoginBridge.getProfile().displayName &&
            window.APP.store.state.credentials.token;
    }

    isGraphDataFilled() {
        return this.msToNativeLoginBridge.getProfile().jobTitle ||
            this.msToNativeLoginBridge.getProfile().phoneNumber ||
            this.msToNativeLoginBridge.getProfile().companyName ||
            this.msToNativeLoginBridge.getProfile().microsoftUserprofilePicture
    }

    async initBasic(basicUserInfo, force) {
        if (this.microsoftGraphService.isInitialized() && !this.isGraphDataFilled()) {
            //graph initialized but graph information not set => force relogin with new information
            force = true;
        }
        if (this.isUserBasicLogged() && !force) {
            //Do not  force login if user is already logged
            return;
        }
        console.log("initBasic : ", basicUserInfo);
        //in this case we login without a graph token
        //only this data available {"displayName":"Admin Aptero","objectId":"abb64646-d3e2-473d-8d13-0b6faff23605","preferredUserName":"admin@aptero.co"}
        const user:any = {};
        user.email = basicUserInfo.preferredUserName;
        user.displayName = basicUserInfo.displayName;
        user.id = basicUserInfo.objectId;


        let profilePicture = "";
        let organization = "";
        let phoneNumber = "";
        let jobTitle = "";
        if (this.microsoftGraphService.isInitialized()) {
            const user = await this.microsoftGraphService.getUserDetails();
            phoneNumber = user.mobilePhone;
            jobTitle = user.jobTitle;
            profilePicture = await this.microsoftGraphService.getUserPhoto();
            organization = await this.microsoftGraphService.getUserOrganization();
        }
        const cred = await this.initBasicInfo();
        let token = user.id;
        try {
            token = cred.ssoToken.token;
        } catch (e) {
            //ignore
        }
        try {
            token = await credential?.getToken(getScopesLight());
        } catch (e) {
            //ignore
        }
        await this.msToNativeLoginBridge.setProfile({
            email: user.email,
            displayName: user.displayName,
            phoneNumber: phoneNumber,
            jobTitle: jobTitle,
            companyName: organization,
            microsoftUserprofilePicture: profilePicture,
            microsoftUser: user.id
        });
        await this.msToNativeLoginBridge.nativeLogin(user.email, token);
    }

    async login() {
        try {
            await this.userInteractionAuth();
        } catch (error) {
            console.log("error", error);
        }

    }

    async checkIsConsentNeeded(consentNeeded) {
        try {
            const token = await credential?.getToken(getScopes());
            Providers.globalProvider.setState(ProviderState.SignedIn);
            getAuthEvents().emit(AUTH_TOKEN, {token: token});
            sendAuthToken({token: token});
        } catch (error) {
            Providers.globalProvider.setState(ProviderState.SignedOut);
            consentNeeded();
        }
    }

    async logout() {
        await this.msToNativeLoginBridge.logout();
        if (Providers.globalProvider.state === ProviderState.SignedIn) {
            if (Providers.globalProvider && Providers.globalProvider.logout) {
                await Providers.globalProvider.logout();
            }
            Providers.globalProvider.setState(ProviderState.SignedOut);
        }
    }

}

