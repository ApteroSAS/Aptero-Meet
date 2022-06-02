import "./module/ButtonAPI/component/custom-controller-button";
import "./module/HubsBridge/component/rtmp-auto-refresh";
import "./module/ButtonAPI/component/media-limiter";
import "./module/CustomPanel/component/open-iframe-button";
import "./module/ButtonAPI/component/stop-share-screen-on-destroy";
import "./module/ButtonAPI/component/release-media-frame-on-destroy";
import "./module/AudioZone/component/trigger";
import "./module/webRTCadapter/adapter-config";
import { ThirdPersonService } from "./module/ThirdPerson/ThirdPersonService";
import "./module/axolotis/AxolotisSystem";
export declare const ENTERED_EVENT = "apt:room:entered";
export declare class ApteroServices {
    thirdPersonService: ThirdPersonService;
    private audioSettingsSystem;
    constructor();
    applySoftRedirect(): void;
    start(audioSettingsSystem: any): void;
    onEnterRoom(): Promise<void>;
    tick(): void;
    remove(): Promise<void>;
    notifySceneEntered(): void;
    notifyLoadingState(state: any, action: any): void;
}
export declare const apteroService: ApteroServices;
