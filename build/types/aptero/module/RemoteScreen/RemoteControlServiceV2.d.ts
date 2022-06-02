export class RemoteControlServiceV2 {
    remoteScreenSessionIdMap: {};
    remoteScreenSessionRfbMap: {};
    lastMoveTime: number;
    screenSize: {};
    lastX: number;
    lastY: number;
    lastSessionID: string;
    start(): Promise<void>;
    getNewRemoteSessionID(): any;
    generateFallBackUrl(urlToProxy: any, userId: any): Promise<string>;
    getScreen(screenElement: any, data: any): Promise<any>;
    createRBF(el: any, url: any, options: any): Promise<any>;
    registerEventOnElement(el: any): void;
    onInteract: (e: any) => void;
    updateCursorPosition(remoteScreenSessionId: any, mouseRatioX: any, mouseRatioY: any): void;
    tryCaptureCursor(intersection: any): void;
}
export const remoteControlServiceV2: RemoteControlServiceV2;
