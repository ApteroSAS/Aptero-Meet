import configs from "../../../../utils/configs";
import { msTeams} from "./MsTeams";
import {
    TeamsUserCredential,
    LogLevel,
    setLogLevel,
    setLogFunction, createMicrosoftGraphClient, TeamsFx, IdentityType
} from "@microsoft/teamsfx";
import * as microsoftTeams from "@microsoft/teams-js";
import {getAuthEvents, LOGGED_BASIC_INFO} from "./AuthEvent";
import { getScopes, getScopesLight } from "./scope";
import {MicrosoftGraphService} from "./MicrosoftGraphService";
import {MsToNativeLoginBridge} from "./MsToNativeLoginBridge";

let credential:TeamsFx | null = null;
export const startLoginPageUrl = window.location.origin + "/auth-start.html";
export const functionEndpoint = window.location.origin + "/auth-start.html";//process.env.REACT_APP_FUNC_ENDPOINT;
export const clientId = configs.APP_CONFIG.MICROSOFT_APP_ID; //process.env.REACT_APP_CLIENT_ID;

declare const window;
//To test and revoke application auth
// https://myapplications.microsoft.com/
// https://portal.office.com/account/?ref=MeControl#apps

function initTeamsFx(authorityHost) {
    if (process.env.NODE_ENV === "development") {
        setLogLevel(LogLevel.Warn);
        setLogFunction((leve, message) => {
            console.warn(message);
        });
    }
    credential = new TeamsFx(IdentityType.User,{
            authorityHost,
            initiateLoginEndpoint: startLoginPageUrl,
            //simpleAuthEndpoint: teamsfxEndpoint,//https://github.com/OfficeDev/TeamsFx/wiki/How-Authentication-Works-in-TeamsFx-Tab-Template
            clientId: clientId
        });
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

    async initGraph(scopes) {
        try {
            const graph = createMicrosoftGraphClient(credential, scopes);
            if(!credential){
                throw new Error();
            }
            this.microsoftGraphService.init(graph);
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
        await cred.login(getScopesLight());//Trigger authorization popup
        //await teamsAuth();
        await this.initGraph(getScopesLight());
        const userInfo = await cred.getUserInfo();//may trigger authorization popup
        await this.initBasic(userInfo, true);
        return cred;
    }

    async upgrade(){
        console.log("upgrade");
        let scope = getScopes();
        const cred = await this.initBasicInfo();
        await cred.login(scope);//Trigger authorization popup
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
            const userInfo = await cred.getUserInfo();
            console.log("passiveAuth (basic):", cred);
            await this.initGraph(getScopesLight());
            await this.initBasic(userInfo, false);
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
        this.msToNativeLoginBridge.setProfile({
            displayName: basicUserInfo.displayName
        });//HACK reset the display name since another process in the code seems to set Guest name

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
            profilePicture = await this.microsoftGraphService.getUserPhotoAsBase64();
            organization = await this.microsoftGraphService.getUserOrganization();
        }
        const cred = await this.initBasicInfo();
        let token = user.id;
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

    async logout() {
        await this.msToNativeLoginBridge.logout();
    }

}

