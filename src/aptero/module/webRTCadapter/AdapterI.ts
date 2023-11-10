import EventEmitter from "eventemitter3";

export interface ConnectOptions {
    serverUrl: string;
    roomId: string;
    serverParams: any; // Replace 'any' with a more specific type if possible
    scene: any; // Replace 'any' with a more specific type if possible
    clientId: string;
    forceTcp: boolean;
    forceTurn: boolean;
    iceTransportPolicy: RTCIceTransportPolicy;
}

/**
 * this.emit("mic-state-changed", { enabled: this.isMicEnabled });
 * This line emits a mic-state-changed event with data about whether the microphone is currently enabled. Listeners to this event would then know the microphone has been toggled and could update the UI accordingly.
 */
export const MIC_EVENT = "mic-state-changed";
export const LOCAL_MEDIA_STREAM_CREATED_EVENT = "local-media-stream-created";


/**
 * Custom Events Dispatched in the Code:
 * EG : document.body.dispatchEvent(new CustomEvent("kicked", { detail: { clientId: clientId } }));
 *
 * "kicked" Event:
 *
 * Description: This event is dispatched when a client is kicked out of the room.
 * Parameters:
 * clientId: The ID of the client who is being kicked.
 * "blocked" Event:
 *
 * Description: This event is dispatched when a client is blocked by another client.
 * Parameters:
 * clientId: The ID of the client who is being blocked.
 * "unblocked" Event:
 *
 * Description: This event is dispatched when a client that was previously blocked is unblocked.
 * Parameters:
 * clientId: The ID of the client who is being unblocked.
 */
export const KICKED_EVENT = "kicked";
export const BLOCKED_EVENT = "blocked";
export const UNBLOCKED_EVENT = "unblocked";
export const RTC_EVENT = "rtc_event";

// Extend the EventEmitter to type the possible custom events
export interface AdapterEvents {
    [MIC_EVENT]: (data: { enabled: boolean }) => void;
    [KICKED_EVENT]: (detail: { clientId: string }) => void;
    [BLOCKED_EVENT]: (detail: { clientId: string }) => void;
    [UNBLOCKED_EVENT]: (detail: { clientId: string }) => void;
    [RTC_EVENT]: (detail: any) => void;
}

// Augment the MediaStreamTrack type to include the _hubs_contentHint property.
// It's best practice not to use underscore prefixes for non-standard attributes,
// but if this is a constraint you have to work with, you'd declare it like this.
export interface MediaStreamTrackWithHint extends MediaStreamTrack {
    _hubs_contentHint?: string; // Assuming the content hint is a string. Adjust the type if necessary.
}

export interface Adapter extends EventEmitter<AdapterEvents> {
    connect(options: ConnectOptions): Promise<void>;

    getMediaStream(clientId: string, kind?: "audio" | "video"): Promise<MediaStream>

    setLocalMediaStream(stream: MediaStream): Promise<void>;

    toggleMicrophone(): void;

    enableMicrophone(enabled: boolean): void;

    get isMicEnabled(): boolean;

    disconnect(): void;

    kick(clientId: string): Promise<void>;

    block(clientId: string): Promise<void>;

    unblock(clientId: string): Promise<void>;
}


export interface SubAdapter {
    createTrack(constraints: MediaStreamConstraints): Promise<MediaStream>;
    unpublishVideoTrack(): Promise<void>;
}
