export const DIALOG_CONNECTION_ERROR_FATAL: "dialog-connection-error-fatal";
export default class NafTwilioAdapter extends EventEmitter<string | symbol, any> {
    constructor();
    _micProducer: {
        track: any;
    };
    _cameraProducer: {
        track: any;
    };
    _shareProducer: {
        track: any;
    };
    _localMediaStream: any;
    _consumers: Map<any, any>;
    _pendingMediaRequests: Map<any, any>;
    _blockedClients: Map<any, any>;
    _forceTcp: boolean;
    _forceTurn: boolean;
    _iceTransportPolicy: any;
    scene: any;
    _serverParams: {};
    _consumerStats: {};
    adapterUserListener: AdapterUserListener;
    get consumerStats(): {};
    /**
     * Gets transport/consumer/producer stats on the server side.
     */
    getServerStats(): Promise<{}>;
    iceRestart(transport: any): Promise<void>;
    recreateSendTransport(iceServers: any): Promise<void>;
    /**
     * Restart ICE in the underlying send peerconnection.
     */
    restartSendICE(): Promise<void>;
    /**
     * Checks the Send Transport ICE status and restarts it in case is in failed state.
     * This is called by the Send Transport "connectionstatechange" event listener.
     * @param {boolean} connectionState The transport connnection state (ICE connection state)
     */
    checkSendIceStatus(connectionState: boolean): void;
    recreateRecvTransport(iceServers: any): Promise<void>;
    /**
     * Restart ICE in the underlying receive peerconnection.
     * @param {boolean} force Forces the execution of the reconnect.
     */
    restartRecvICE(): Promise<void>;
    /**
     * Checks the ReeceiveReeceive Transport ICE status and restarts it in case is in failed state.
     * This is called by the Reeceive Transport "connectionstatechange" event listener.
     * @param {boolean} connectionState The transport connection state (ICE connection state)
     */
    checkRecvIceStatus(connectionState: boolean): void;
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
    }): Promise<any>;
    _serverUrl: any;
    _roomId: any;
    _joinToken: any;
    _clientId: any;
    subAdapter: AgoraAdapter;
    protooHelper: ProtooHelper;
    _protoo: any;
    _closed: boolean;
    _retryConnectWithNewHost(): Promise<void>;
    closePeer(peerId: any): void;
    resolvePendingMediaRequestForTrack(clientId: any, track: any): void;
    removeConsumer(consumerId: any): void;
    getMediaStream(clientId: any, kind?: string): Promise<any>;
    createSendTransport(iceServers: any): Promise<void>;
    closeSendTransport(): Promise<void>;
    createRecvTransport(iceServers: any): Promise<void>;
    closeRecvTransport(): Promise<void>;
    _joinRoom(): Promise<void>;
    setLocalMediaStream(stream: any): Promise<void>;
    enableCamera(track: any): Promise<void>;
    disableCamera(): Promise<void>;
    enableShare(track: any): Promise<void>;
    disableShare(): Promise<void>;
    toggleMicrophone(): void;
    enableMicrophone(enabled: any): void;
    _micShouldBeEnabled: any;
    get isMicEnabled(): boolean;
    cleanUpLocalState(): void;
    disconnect(): void;
    kick(clientId: any, permsToken: any): Promise<void>;
    block(clientId: any): Promise<void>;
    unblock(clientId: any): Promise<void>;
    emitRTCEvent(level: any, tag: any, msgFunc: any): void;
}
import EventEmitter from "eventemitter3";
import AdapterUserListener from "./AdapterUserListener";
import { AgoraAdapter } from "./agora";
import { ProtooHelper } from "./protoHelper";
