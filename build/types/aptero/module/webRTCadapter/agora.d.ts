export class AgoraAdapter {
    constructor(adapterUserListener: any);
    currentRoom: any;
    adapterUserListener: any;
    convertId(clientid: any): any;
    enableMicrophone(enabled: any): void;
    isMicEnabled(): boolean;
    disableCamera(): Promise<void>;
    disableShare(): Promise<void>;
    createTrack(constraints: any): Promise<MediaStream>;
    _videoProducer: import("agora-rtc-sdk-ng").ICameraVideoTrack | ([import("agora-rtc-sdk-ng").ILocalVideoTrack, import("agora-rtc-sdk-ng").ILocalAudioTrack] & import("agora-rtc-sdk-ng").ILocalVideoTrack);
    _micProducer: import("agora-rtc-sdk-ng").IMicrophoneAudioTrack;
    connectRoom(clientId: any, roomId: any): Promise<void>;
    setOnTrack(onTrack: any): void;
    onTrack: any;
    setOnTrackRemoved(onTrackRemoved: any): void;
    onTrackRemoved: any;
    setOnParticipantDisconnected(onParticipantDisconnected: any): void;
    onParticipantDisconnected: any;
    disconnect(): void;
    unpublishAudioTrack(): Promise<void>;
    unpublishVideoTrack(): Promise<void>;
}
