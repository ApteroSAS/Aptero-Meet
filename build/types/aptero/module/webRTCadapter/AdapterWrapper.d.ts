export class AdapterWarpper {
    lasyLoadingFinished: boolean;
    tmplisteners: {};
    tmpEventEmiter: EventEmitter<string | symbol, any>;
    on: (event: any, fn: any) => void;
    internalInit(): Promise<void>;
    __proto__: any;
}
import EventEmitter from "eventemitter3";
