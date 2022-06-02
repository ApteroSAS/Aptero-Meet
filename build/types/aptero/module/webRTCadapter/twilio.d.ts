export class TwilioAdapter {
    constructor(adapterUserListener: any);
    currentRoom: any;
    videoTrack: any;
    twilioMicEnable: boolean;
    onTrack: () => void;
    adapterUserListener: any;
    convertId(twilioCLientId: any): any;
    unpublishGivenVideoTrack(track: any): Promise<void>;
    unpublishVideoTrack(): Promise<void>;
    enableMicrophone(enabled: any): void;
    isMicEnabled(): boolean;
    disableCamera(): Promise<void>;
    disableShare(): Promise<void>;
    createTrack(constraints: any): Promise<MediaStream>;
    connectRoom(clientId: any, roomId: any): Promise<void>;
    setOnTrack(onTrack: any): void;
    setOnTrackRemoved(onTrackRemoved: any): void;
    onTrackRemoved: any;
    setOnParticipantDisconnected(onParticipantDisconnected: any): void;
    onParticipantDisconnected: any;
    disconnect(): void;
    unpublishAudioTrack(): Promise<void>;
}
