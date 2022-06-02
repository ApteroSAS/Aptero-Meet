/**
 * SocketIO Adapter (socketio)
 * networked-scene: serverURL needs to be ws://localhost:8080 when running locally
 */
export default class SocketioAdapter extends EventEmitter<string | symbol, any> {
    constructor();
    app: string;
    room: string;
    occupantListener: any;
    myRoomJoinTime: any;
    myId: any;
    occupants: {};
    connectedClients: any[];
    serverTimeRequests: number;
    timeOffsets: any[];
    avgTimeOffset: number;
    setServerUrl(wsUrl: any): void;
    wsUrl: string;
    setClientId(clientId: any): void;
    _clientId: any;
    /***
     * MOZ Specific Start
     */
    setReconnectionListeners(reconnectingListener: any, reconnectedListener: any): void;
    _reconnectingListener: any;
    _reconnectedListener: any;
    setTurnConfig(forceTcp: any, forceTurn: any): void;
    syncOccupants(): void;
    setServerParams(params: any): void;
    _serverParams: any;
    setJoinToken(joinToken: any): void;
    _joinToken: any;
    enableMicrophone(enabled: any): void;
    disableShare(): Promise<void>;
    kick(clientId: any, permsToken: any): void;
    block(clientId: any): void;
    unblock(clientId: any): void;
    enableShare(track: any): Promise<void>;
    toggleFreeze(): void;
    freeze(): void;
    unfreeze(): void;
    setLocalMediaStream(stream: any): void;
    /**
     * MOZ Specific end
     */
    setApp(appName: any): void;
    setRoom(roomName: any): void;
    setWebRtcOptions(options: any): void;
    setServerConnectListeners(successListener: any, failureListener: any): void;
    connectSuccess: any;
    connectFailure: any;
    setRoomOccupantListener(occupantListener: any): void;
    setDataChannelListeners(openListener: any, closedListener: any, messageListener: any): void;
    openListener: any;
    closedListener: any;
    messageListener: any;
    connect(): Promise<any>;
    joinRoom(): void;
    receivedOccupants(occupants: any): void;
    shouldStartConnectionTo(client: any): boolean;
    startStreamConnection(remoteId: any): void;
    closeStreamConnection(clientId: any): void;
    getConnectStatus(clientId: any): any;
    sendData(to: any, type: any, data: any): void;
    sendDataGuaranteed(to: any, type: any, data: any): void;
    broadcastData(type: any, data: any): void;
    broadcastDataGuaranteed(type: any, data: any): void;
    getMediaStream(clientId: any): void;
    updateTimeOffset(): Promise<void>;
    getServerTime(): number;
    disconnect(): void;
}
import EventEmitter from "eventemitter3";
