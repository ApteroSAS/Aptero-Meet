export class CustomActionRegister {
    actions: {};
    triggers: {};
    actionAnimationController: ActionAnimationController;
    triggerAction(id: any, data: any): Promise<void>;
    start(): Promise<void>;
    setup(htmlElement: any, action: any, actionid: any): void;
    actionExist(actionid: any): boolean;
    handleEntry(entry: any, mediaOptions?: any): Promise<any>;
    getMediaOptionSetting(actionData: any): {
        distanceModel: any;
        rolloffFactor: any;
        refDistance: any;
        maxDistance: any;
        coneInnerAngle: any;
        coneOuterAngle: any;
        coneOuterGain: any;
    };
    convertToNetEntity(entity: any): Promise<any>;
    onReady(entity: any, callback: any): void;
    waitForNetworkEl(el: any): Promise<any>;
    spawnAttach(actionData: any, entry: any): Promise<void>;
    removeOldMediaFrameEntity(mediaFrame: any): Promise<any>;
    findMediaFrameByName(name: any): Promise<any>;
    removeFromMediaFrame(actionData: any): Promise<void>;
    url(actionData: any): Promise<void>;
    convertToEntry(id: any, data: any): any;
}
export const customActionRegister: CustomActionRegister;
import { ActionAnimationController } from "./ActionAnimationController";
