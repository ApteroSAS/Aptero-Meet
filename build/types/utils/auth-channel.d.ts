export default class AuthChannel {
    constructor(store: any);
    store: any;
    socket: any;
    _signedIn: boolean;
    setSocket: (socket: any) => void;
    get email(): any;
    get signedIn(): boolean;
    signOut: (hubChannel: any) => Promise<void>;
    verifyAuthentication(authTopic: any, authToken: any, authPayload: any): Promise<any>;
    startAuthentication(email: any, hubChannel: any): Promise<{
        authComplete: Promise<any>;
    }>;
    handleAuthCredentials(email: any, token: any, hubChannel: any): Promise<void>;
}
