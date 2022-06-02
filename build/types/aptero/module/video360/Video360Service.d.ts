export class Video360Service {
    eventEmitter: EventEmitter<string | symbol, any>;
    video: any;
    videoSphere: any;
    start(): void;
    play(time?: number, notifyNetwork?: boolean): void;
    pause(time?: number, notifyNetwork?: boolean): void;
    getCurrentTime(): any;
    setTime(time: any, notifyNetwork?: boolean): void;
    enableAndSetVideo(video: any, aVideoSphere: any): void;
    disable(): void;
    isEnable(): any;
    action(type: any): void;
    onUserJoin(): void;
}
export const video360Service: Video360Service;
import EventEmitter = require("eventemitter3");
