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
    appData?: {peerId:string}
}

export default class NafTwilioAdapter extends EventEmitter<AdapterEvents> implements Adapter, SubAdapter {
    private _micProducer: MediaStreamTrack | null = null;
    private _cameraProducer: MediaStreamTrack | null = null;
    private _shareProducer: MediaStreamTrack | null = null; // Assuming screen share is a video track
    private _localMediaStream: MediaStream | null = null;
    private _consumers: Map<string, MediaStreamTrackWithAppData> = new Map();
    private _pendingMediaRequests: Map<string, Record<string, { resolve:(data:MediaStream)=>void,reject:()=>void,promise:Promise<MediaStream> }>> = new Map();
    private _blockedClients: Map<string, boolean> = new Map();
    private scene: EventEmitter<AdapterEvents> | null = null;
    private readonly adapterUserListener: AdapterUserListener = new AdapterUserListener();
    private _serverUrl: string = "";
    private _clientId: string = "";
    private _roomId: string = "";
    private subAdapter: TwilioAdapter | null = null;
    private _closed: boolean = false;
    private _micEnabled: boolean = false;
    private _micShouldBeEnabled: boolean = false;
    private lastTrack: MediaStreamConstraints | null = null;

    constructor() {
        super();
        this._micProducer = null;
        this._cameraProducer = null;
        this._shareProducer = null;
        this._localMediaStream = null;
        this._consumers = new Map();
        this._pendingMediaRequests = new Map();
        this._blockedClients = new Map();
        this.scene = null;
    }

    public async connect({
                             serverUrl,
                             roomId,
                             scene,
                             clientId
                         }): Promise<void> {
        this._serverUrl = serverUrl;
        this._roomId = roomId;
        this._clientId = clientId;
        this.scene = scene;

        this.subAdapter = new TwilioAdapter(this.adapterUserListener);
        this.subAdapter.setOnTrack((track, peerId, trackid) => {
            const trackWithAppData = track as MediaStreamTrackWithAppData;
            //RemoteAudioTrack
            console.log("Add consumer:", trackWithAppData);
            trackWithAppData.appData = {peerId};
            this._consumers.set(trackid, trackWithAppData);
            this.resolvePendingMediaRequestForTrack(peerId, trackWithAppData);
        });
        this.subAdapter.setOnTrackRemoved((trackId: string) => {
            this._consumers.delete(trackId);
        });
        /*this.subAdapter.setOnParticipantDisconnected((peerId)=>{
          this._consumers.forEach(consumer => {
            if (consumer.appData.peerId === peerId && "video" === consumer.track.kind) {
              this.subAdapter.unpublishGivenVideoTrack(consumer);
            }
          });
        });*/
        await this.subAdapter.connectRoom(this._clientId, this._roomId);

        const urlWithParams = new URL(this._serverUrl);
        urlWithParams.searchParams.append("roomId", this._roomId);
        urlWithParams.searchParams.append("peerId", this._clientId);

        this._closed = false;

        return new Promise<void>(async (resolve, reject) => {
            try {
                await this._joinRoom();
                if (this.lastTrack) {
                    await this.createTrack(this.lastTrack);
                }
                resolve();
            } catch (err) {
                this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${err}`);
                reject(err);
            }
        });
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

    private async _joinRoom() {
        if (this._localMediaStream) {
            // TODO: Refactor to be "Create producers"
            await this.setLocalMediaStream(this._localMediaStream);
            this.enableMicrophone(this._micShouldBeEnabled);//use last state for mic (useful for fast room switching)
        }
    }

    public async setLocalMediaStream(stream: MediaStream): Promise<void> {
        this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);
        let sawAudio = false;
        let sawVideo = false;

        await Promise.all(
            stream.getTracks().map(async (track: MediaStreamTrackWithHint) => {
                if (track.kind === "audio") {
                    sawAudio = true;

                    // TODO multiple audio tracks?
                    if (this._micProducer) {
                        if (this._micProducer !== track) {
                            this._micProducer.stop();
                            //this._micProducer.replaceTrack(track);
                        }
                    } else {
                        if (!this._micEnabled) {
                            track.enabled = false;
                        }

                        // stopTracks = false because otherwise the track will end during a temporary disconnect
                        this._micProducer = track;
                    }
                } else {
                    sawVideo = true;

                    if (track._hubs_contentHint === "share") {
                        await this.disableCamera();
                        this._shareProducer = track;
                    } else if (track._hubs_contentHint === "camera") {
                        await this.disableShare();
                        this._cameraProducer = track;
                    }
                }

                this.resolvePendingMediaRequestForTrack(this._clientId, track);
            })
        );

        if (!sawAudio && this._micProducer) {
            this._micProducer.stop();
            this._micProducer = null;
        }
        if (!sawVideo) {
            await this.disableCamera();
            await this.disableShare();
        }
        this._localMediaStream = stream;
    }

    private async disableCamera() {
        if (!this._cameraProducer) return;
        this._cameraProducer = null;
        return await this.subAdapter.unpublishVideoTrack();
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

    public async createTrack(constraints: MediaStreamConstraints): Promise<MediaStream> {
        this.lastTrack = constraints;
        return this.subAdapter.createTrack(constraints);
    }

    private async disableShare() {
        if (!this._shareProducer) return;
        this._shareProducer = null;
        return await this.subAdapter.unpublishVideoTrack();
    }

    public toggleMicrophone(): void {
        if (this.isMicEnabled) {
            this.enableMicrophone(false);
        } else {
            this.enableMicrophone(true);
        }
    }

    public enableMicrophone(enabled: boolean) {
        this.subAdapter.enableMicrophone(enabled);
        this._micShouldBeEnabled = enabled;
        this.emit("mic-state-changed", {enabled: this.isMicEnabled});
    }

    public get isMicEnabled(): boolean {
        if (!this.subAdapter) {
            return false;
        }
        return this.subAdapter.isMicEnabled();
    }

    private cleanUpLocalState() {
        this._micProducer = null;
        this._shareProducer = null;
        this._cameraProducer = null;
    }

    public disconnect() {
        if (this.subAdapter) {
            this.subAdapter.disconnect();
        }
        if (this._closed) return;

        this.cleanUpLocalState();
        this.adapterUserListener.disconnect();
    }

    public async kick(clientId: string): Promise<void> {
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


    public getMediaStream(clientId: string, kind = "audio"): Promise<MediaStream> {
        let track: MediaStreamTrack;

        if (this._clientId === clientId) {
            if (kind === "audio" && this._micProducer) {
                track = this._micProducer;
            } else if (kind === "video") {
                if (this._cameraProducer && this._cameraProducer.enabled) {
                    track = this._cameraProducer;
                } else if (this._shareProducer && this._shareProducer.enabled) {
                    track = this._shareProducer;
                }
            }
        } else {
            this._consumers.forEach(consumer => {
                if (consumer.appData.peerId === clientId && kind == consumer.kind) {
                    track = consumer;
                }
            });
        }

        if (track) {
            console.debug(`Already had ${kind} for ${clientId}`);
            return Promise.resolve(new MediaStream([track]));
        } else {
            console.debug(`Waiting on ${kind} for ${clientId}`);
            if (!this._pendingMediaRequests.has(clientId)) {
              this._pendingMediaRequests.set(clientId, {});
            }

            const requests = this._pendingMediaRequests.get(clientId);
            const promise = new Promise<MediaStream>((resolve, reject) => (requests[kind] = {resolve, reject,promise:null}));
            requests[kind].promise = promise;
            promise.catch(e => {
                this.emitRTCEvent("error", "Adapter", () => `getMediaStream error: ${e}`);
                console.warn(`${clientId} getMediaStream Error`, e);
            });
            return promise;
        }
    }
}
