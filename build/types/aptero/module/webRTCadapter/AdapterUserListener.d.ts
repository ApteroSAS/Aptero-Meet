export default class AdapterUserListener {
    em: EventEmitter<string | symbol, any>;
    onUserEnter(callback: any): () => void;
    onUserLeave(callback: any): () => void;
    notifyUserEnter(peerid: any): void;
    notifyUserLeave(peerid: any): void;
    disconnect(): void;
}
import EventEmitter from "eventemitter3";
