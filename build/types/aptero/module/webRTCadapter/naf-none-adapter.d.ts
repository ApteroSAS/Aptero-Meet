export default class NoneAdapter extends EventEmitter<string | symbol, any> {
    constructor();
    occupants: {};
    adapterUserListener: AdapterUserListener;
    connect({ serverUrl, roomId, joinToken, serverParams, scene, clientId, forceTcp, forceTurn, iceTransportPolicy }: {
        serverUrl: any;
        roomId: any;
        joinToken: any;
        serverParams: any;
        scene: any;
        clientId: any;
        forceTcp: any;
        forceTurn: any;
        iceTransportPolicy: any;
    }): Promise<void>;
    _serverUrl: any;
    _roomId: any;
    _joinToken: any;
    _serverParams: any;
    _clientId: any;
    scene: any;
    _forceTcp: any;
    _forceTurn: any;
    _iceTransportPolicy: any;
    toggleMicrophone(): void;
    enableMicrophone(enabled: any): void;
    getMediaStream(clientId: any, kind: any): Promise<any>;
    setLocalMediaStream(stream: any): void;
    disconnect(): void;
}
import EventEmitter from "eventemitter3";
import AdapterUserListener from "./AdapterUserListener";
