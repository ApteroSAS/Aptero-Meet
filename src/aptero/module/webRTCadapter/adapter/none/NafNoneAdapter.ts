import EventEmitter from "eventemitter3";
import AdapterUserListener from "../../AdapterUserListener";
import {Adapter, AdapterEvents} from "../../AdapterI";
import {DIALOG_CONNECTION_CONNECTED} from "../dialog/naf-dialog-adapter";

export default class NafNoneAdapter extends EventEmitter<AdapterEvents> implements Adapter {
    occupants = {};
    constructor() {
        super();
    }

    async connect({serverUrl, roomId, scene, clientId}:
                      {
                          serverUrl: string;
                          roomId: string;
                          scene: EventEmitter<AdapterEvents>;
                          clientId: string
                      }) {
        //setTimeout(()=> this.emit(DIALOG_CONNECTION_CONNECTED),30000);
        this.emit(DIALOG_CONNECTION_CONNECTED);
    }

    disconnect() {
    }

    async block(clientId: string): Promise<void> {
    }

    enableMicrophone(enabled: boolean): void {
    }

    async getMediaStream(clientId: string, kind?: "audio" | "video"): Promise<MediaStream> {
        return null;
    }

    get isMicEnabled(): boolean {
        return false;
    }

    async kick(clientId: string): Promise<void> {
    }

    async setLocalMediaStream(stream: MediaStream): Promise<void> {
    }

    toggleMicrophone(): void {
    }

    async unblock(clientId: string): Promise<void> {
    }
}
