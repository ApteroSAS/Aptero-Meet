export default class DialogIODataOnlyAdapter extends EventEmitter<string | symbol, any> {
    constructor();
    _timeOffsets: any[];
    _occupants: {};
    _micProducer: any;
    _cameraProducer: any;
    _shareProducer: any;
    _mediaStreams: {};
    _localMediaStream: any;
    _consumers: Map<any, any>;
    _frozenUpdates: Map<any, any>;
    _pendingMediaRequests: Map<any, any>;
    _micEnabled: boolean;
    _initialAudioConsumerPromise: Promise<any[]>;
    _initialAudioConsumerResolvers: Map<any, any>;
    _serverTimeRequests: number;
    _avgTimeOffset: number;
    _blockedClients: Map<any, any>;
    type: string;
    occupants: {};
    _forceTcp: boolean;
    _forceTurn: boolean;
    _iceTransportPolicy: string;
    _closed: boolean;
    scene: Element;
    _serverParams: {};
    _consumerStats: {};
    _isReconnect: boolean;
    get consumerStats(): {};
    get downlinkBwe(): any;
    get serverUrl(): any;
    setServerUrl(url: any): void;
    _serverUrl: any;
    setJoinToken(joinToken: any): void;
    _joinToken: any;
    setTurnConfig(forceTcp: any, forceTurn: any): void;
    setServerParams(params: any): void;
    setApp(): void;
    setRoom(roomId: any): void;
    _roomId: any;
    setClientId(clientId: any): void;
    _clientId: any;
    setServerConnectListeners(successListener: any, failureListener: any): void;
    _connectSuccess: any;
    _connectFailure: any;
    setRoomOccupantListener(occupantListener: any): void;
    _onOccupantsChanged: any;
    setDataChannelListeners(openListener: any, closedListener: any, messageListener: any): void;
    _onOccupantConnected: any;
    _onOccupantDisconnected: any;
    _onOccupantMessage: any;
    /**
     * Gets transport/consumer/producer stats on the server side.
     */
    getServerStats(): Promise<{
        error: string;
    }>;
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
    connect(): Promise<void>;
    newPeer(peer: any): void;
    closePeer(peerId: any): void;
    shouldStartConnectionTo(): boolean;
    startStreamConnection(): void;
    closeStreamConnection(): void;
    resolvePendingMediaRequestForTrack(clientId: any, track: any): void;
    removeConsumer(consumerId: any): void;
    getConnectStatus(): any;
    getMediaStream(clientId: any, kind?: string): void;
    getServerTime(): number;
    sendData(clientId: any, dataType: any, data: any): void;
    sendDataGuaranteed(clientId: any, dataType: any, data: any): void;
    broadcastData(dataType: any, data: any): void;
    broadcastDataGuaranteed(dataType: any, data: any): void;
    setReconnectionListeners(reconnectingListener: any, reconnectedListener: any): void;
    _reconnectingListener: any;
    _reconnectedListener: any;
    syncOccupants(): void;
    createSendTransport(iceServers: any): Promise<void>;
    closeSendTransport(): Promise<void>;
    createRecvTransport(iceServers: any): Promise<void>;
    closeRecvTransport(): Promise<void>;
    createMissingConsumers(): Promise<void>;
    _joinRoom(): Promise<void>;
    setLocalMediaStream(stream: any): void;
    createMissingProducers(stream: any): void;
    enableCamera(track: any): Promise<void>;
    disableCamera(): Promise<void>;
    enableShare(track: any): Promise<void>;
    disableShare(): Promise<void>;
    enableMicrophone(enabled: any): void;
    setWebRtcOptions(): void;
    isDisconnected(): boolean;
    disconnect(): void;
    reconnect(timeout?: number): void;
    kick(clientId: any, permsToken: any): void;
    block(clientId: any): void;
    unblock(clientId: any): void;
    updateTimeOffset(): Promise<void>;
    toggleFreeze(): void;
    freeze(): void;
    frozen: boolean;
    unfreeze(): void;
    storeMessage(message: any): void;
    storeSingleMessage(message: any, index: any): void;
    onDataChannelMessage(e: any, source: any): void;
    onData(message: any, source: any): void;
    getPendingData(networkId: any, message: any): any;
    getPendingDataForNetworkId(networkId: any): any;
    flushPendingUpdates(): void;
    dataForUpdateMultiMessage(networkId: any, message: any): any;
    emitRTCEvent(level: any, tag: any, msgFunc: any): void;
}
import EventEmitter from "eventemitter3";
