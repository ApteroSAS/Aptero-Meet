import {TwilioAdapter} from "./twilio";
import EventEmitter from "eventemitter3";
import AdapterUserListener from "../../AdapterUserListener";
import {Adapter, AdapterEvents, MediaStreamTrackWithHint, SubAdapter} from "../../AdapterI";

// NOTE this adapter does not properly fire the onOccupantsReceived events since those are only needed for
// data channels, which are not yet supported. To fire that event, this class would need to keep a list of
// occupants around and manage it.
// Used for VP9 webcam video.


declare const window: any;

export interface MediaStreamTrackWithAppData extends MediaStreamTrack {
    appData?: { peerId: string }
}

export default class NafTwilioAdapter extends EventEmitter<AdapterEvents> implements Adapter, SubAdapter {
    //local participant
    private _localMediaStream: MediaStream | null = null;

    //remote participant
    private _consumers: Map<string, MediaStreamTrackWithAppData> = new Map();
    private _pendingMediaRequests: Map<string, Record<string, {
        resolve: (data: MediaStream) => void,
        reject: () => void,
        promise: Promise<MediaStream>
    }>> = new Map();
    private _blockedClients: Map<string, boolean> = new Map();
    private readonly adapterUserListener: AdapterUserListener = new AdapterUserListener();

    //general
    private scene: EventEmitter<AdapterEvents> | null = null;
    private _clientId: string = "";
    private _roomId: string = "";
    private twilioProxy: TwilioAdapter | null = null;

    constructor() {
        super();
    }

    public async connect({serverUrl, roomId, scene, clientId}:
                             {
                                 serverUrl: string;
                                 roomId: string;
                                 scene: EventEmitter<AdapterEvents>;
                                 clientId: string
                             }): Promise<void> {
        this.disconnect();//reconnect cases
        this._roomId = roomId;
        this._clientId = clientId;
        this.scene = scene;

        this.twilioProxy = new TwilioAdapter(this.adapterUserListener);
        this.twilioProxy.setOnTrack((track, peerId, trackid) => {
            const trackWithAppData = track as MediaStreamTrackWithAppData;
            //RemoteAudioTrack
            console.log("Add consumer:", trackWithAppData);
            trackWithAppData.appData = {peerId};
            this._consumers.set(trackid, trackWithAppData);
            this.resolvePendingMediaRequestForTrack(peerId, trackWithAppData);
        });
        this.twilioProxy.setOnTrackRemoved((trackId: string) => {
            this._consumers.delete(trackId);
        });
        await this.twilioProxy.connectRoom(this._clientId, this._roomId);

        try {
            if (this._localMediaStream) {
                //publish local media stream (mic and webcam if we have them otherwise we will ave them later)
                await this.setLocalMediaStream(this._localMediaStream);
                this.enableMicrophone(this.twilioProxy.isMicEnabled());//use last state for mic (useful for fast room switching) - used to notify mic state
            }
        } catch (err) {
            this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${err}`);
        }
    }

    public disconnect() {
        if (this.twilioProxy) {
            this.twilioProxy.disconnect();
            this.twilioProxy.setOnTrack(() => {console.error("onTrack not bound")});
            this.twilioProxy.setOnTrackRemoved(() => {console.error("onTrackRemoved not bound")});
            this.adapterUserListener.disconnect();
        }
    }

    /**
     * Set the local media stream (Mic and webcam)
     * all media stram are updated at each call
     * @param stream
     */
    public async setLocalMediaStream(stream: MediaStream): Promise<void> {
        //console.log("setLocalMediaStream", stream);
        this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);
        let sawAudio = false;
        let sawVideo = false;

        for (const track of stream.getTracks() as MediaStreamTrackWithHint[]) {
            //we do not need to unpublish the old track sinnc is will already have been unpublished by the twili oadapter
            if (track.kind === "audio") {
                sawAudio = true;
            } else {
                sawVideo = true;
            }
            this.resolvePendingMediaRequestForTrack(this._clientId, track);
        }
        //remove unused producers
        if (!sawAudio) {
            await this.twilioProxy.unpublishLocalParticipantAudioTrack();
        }
        if (!sawVideo) {
            await this.twilioProxy.unpublishLocalParticipantVideoTrack();
        }
        this._localMediaStream = stream;
    }

    /**
     * create the local participant track (Mic, Sharscreen, Webcam)
     **/
    public async createTrack(constraints: MediaStreamConstraints): Promise<MediaStream> {
        return this.twilioProxy.createLocalTrack(constraints);
    }

    public toggleMicrophone(): void {
        if (this.isMicEnabled) {
            this.enableMicrophone(false);
        } else {
            this.enableMicrophone(true);
        }
    }

    public enableMicrophone(enabled: boolean) {
        this.twilioProxy.enableMicrophone(enabled);
        this.emit("mic-state-changed", {enabled: this.isMicEnabled});
    }

    public get isMicEnabled(): boolean {
        if (!this.twilioProxy) {
            return false;
        }
        return this.twilioProxy.isMicEnabled();
    }

    public async kick(clientId: string): Promise<void> {
        await this.block(clientId);
        document.body.dispatchEvent(new CustomEvent("kicked", {detail: {clientId: clientId}}));
    }

    public async block(clientId: string): Promise<void> {
        this._blockedClients.set(clientId, true);
        document.body.dispatchEvent(new CustomEvent("blocked", {detail: {clientId: clientId}}));
    }

    public async unblock(clientId: string): Promise<void> {
        this._blockedClients.delete(clientId);
        document.body.dispatchEvent(new CustomEvent("unblocked", {detail: {clientId: clientId}}));
    }

    /** get media stream for a given client (including local client) */
    public async getMediaStream(clientId: string, kind = "audio"): Promise<MediaStream> {
        let track: MediaStreamTrack;

        //Try to find already existing track
        if (this._clientId === clientId) {
            if (kind === "audio") {
                track = this.twilioProxy.getLocalAudioTrack()?.mediaStreamTrack;
            } else if (kind === "video") {
                track = this.twilioProxy.getLocalVideoTrack()?.mediaStreamTrack;
            }
        } else {
            for (const consumer of this._consumers.values()) {
                if (consumer.appData.peerId === clientId && kind == consumer.kind) {
                    track = consumer;
                }
            }
        }

        if (track) {
            console.debug(`Already had ${kind} for ${clientId}`);
            return new MediaStream([track]);
        } else {
            console.debug(`Waiting on ${kind} for ${clientId}`);
            if (!this._pendingMediaRequests.has(clientId)) {
                this._pendingMediaRequests.set(clientId, {});
            }

            const requests = this._pendingMediaRequests.get(clientId);
            const promise = new Promise<MediaStream>((resolve, reject) => (requests[kind] = {
                resolve,
                reject,
                promise: null
            }));
            requests[kind].promise = promise;
            promise.catch(e => {
                this.emitRTCEvent("error", "Adapter", () => `getMediaStream error: ${e}`);
                console.warn(`${clientId} getMediaStream Error`, e);
            });
            return promise;
        }
    }

    private resolvePendingMediaRequestForTrack(clientId: string, track: MediaStreamTrack): void {
        const requests = this._pendingMediaRequests.get(clientId);

        if (requests && requests[track.kind]) {
            const resolve = requests[track.kind].resolve;
            delete requests[track.kind];
            resolve(new MediaStream([track]));
        }

        if (requests && Object.keys(requests).length === 0) {
            this._pendingMediaRequests.delete(clientId);
        }
    }

    private emitRTCEvent(level: string, tag: string, msgFunc: () => string) {
        if (!window.APP.store.state.preferences.showRtcDebugPanel) return;
        const time = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        });
        this.scene.emit("rtc_event", {level, tag, time, msg: msgFunc()});
    }

    public unpublishVideoTrack(): Promise<void> {
        return this.twilioProxy.unpublishLocalParticipantVideoTrack();
    }
}
