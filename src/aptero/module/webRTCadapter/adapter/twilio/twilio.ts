import * as Video from "twilio-video";
import {propertiesService} from "../../../properties/propertiesService";
import {getAdapterParams} from "../../adapter-config";
import AdapterUserListener from "../../AdapterUserListener";

export class TwilioAdapter {
    private currentRoom: Video.Room = null;
    private twilioMicEnable = false;
    private adapterUserListener: AdapterUserListener;
    private clientId: string;
    private roomId: string;
    private onTrack: (track: MediaStreamTrack, peerId: string, trackid: string) => void = () => {
        console.error("onTrack not bound");
    };
    private onTrackRemoved: (trackId: string) => void = () => {
        console.error("onTrackRemoved not bound");
    };

    constructor(adapterUserListener: AdapterUserListener) {
        this.adapterUserListener = adapterUserListener;
    }

    private convertId(twilioClientId: string) {
        return twilioClientId.split("/")[0];
    }

    public async unpublishLocalParticipantAudioTrack(): Promise<void> {
        if (!this.currentRoom) {
            return;
        }
        this.enableMicrophone(false);//mute so that when we republish it is muted
        for (let publication of this.currentRoom.localParticipant.tracks) {
            const publicationTrack = publication[1];
            if (publicationTrack.track.kind === "audio") {
                publicationTrack.unpublish();
            }
        }
    }

    private async unpublishGivenAudioTrack(track: Video.RemoteAudioTrack) {
        if (track && this.currentRoom) {
            track.detach();
            this.currentRoom.localParticipant.unpublishTrack(track.mediaStreamTrack);
        }
    }

    private async unpublishGivenVideoTrack(track: Video.RemoteVideoTrack) {
        if (track && this.currentRoom) {
            track.detach();
            this.currentRoom.localParticipant.unpublishTrack(track.mediaStreamTrack);
        }
    }

    public getLocalAudioTrack(): Video.LocalAudioTrack {
        let ret = [];
        for (let publication of this.currentRoom.localParticipant.audioTracks) {
            const publicationTrack = publication[1];
            ret.push(publicationTrack.track);
        }
        if (ret.length !== 1) {
            throw new Error("Expected 1 audio track, got " + ret.length);
        }
        return ret[0];
    }

    public getLocalVideoTrack(): Video.LocalVideoTrack {
        let ret = [];
        for (let publication of this.currentRoom.localParticipant.videoTracks) {
            const publicationTrack = publication[1];
            ret.push(publicationTrack.track);
        }
        if (ret.length !== 1) {
            throw new Error("Expected 1 video track, got " + ret.length);
        }
        return ret[0];
    }

    public async unpublishLocalParticipantVideoTrack() {
        if(!this.currentRoom){
            return;
        }
        for (let publication of this.currentRoom.localParticipant.videoTracks) {
            const publicationTrack = publication[1];
            if (publicationTrack.track.kind === "video") {
                publicationTrack.unpublish();
            }
        }
    }

    public enableMicrophone(enabled: boolean) {
        if (this.currentRoom) {
            for (let [, publication] of this.currentRoom.localParticipant.audioTracks) {
                if (enabled) {
                    publication.track.enable();
                } else {
                    publication.track.disable();
                }
            }
        }
        this.twilioMicEnable = enabled;
    }

    public isMicEnabled(): boolean {
        return this.twilioMicEnable;
    }

    /**
     * create the local participant track (Mic, Sharscreen, Webcam)
     **/
    public async createLocalTrack(constraints: MediaStreamConstraints): Promise<MediaStream> {

        //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
        //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
        /*
        //not working for some reason so we use the workaround below
        let localTracks = await Video.createLocalTracks(constraints);
        if(localTracks.length !== 1) {
            console.warn("Unexpected track number :",localTracks);
        }
        const localTrack = localTracks[0];
        */
        let localTrack: Video.LocalTrack;
        if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
            if ((constraints.video as any).mediaSource === "camera") {//hint that we want a camera
                //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
                const localTracks = await Video.createLocalTracks(constraints);
                if(localTracks.length !== 1) {
                    console.error("Unexpected track number :",localTracks);
                }
                localTrack = localTracks[0];
            } else {
                //a share-screen can have an audio and video constraint (audio doesn't necessary mean microphone)
                // - it will still be registered as a video kind (if it has at least one video)
                //TODO HACK share screen does not work with audio in out app
                if (constraints.audio && constraints.video) {
                    delete constraints["audio"];//delete audio constraint because it is not supported by twilio and it is most probably a share-screen
                }
                //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
                let stream = await navigator.mediaDevices.getDisplayMedia(constraints);
                localTrack = new Video.LocalVideoTrack(stream.getTracks()[0]);
            }
        } else if (constraints.audio) {
            //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
            const localTracks = await Video.createLocalTracks(constraints);
            if(localTracks.length !== 1) {
                console.error("Unexpected track number :",localTracks);
            }
            localTrack = localTracks[0];
        } else {
            throw new Error("Unsupported constraints");
        }


        if (localTrack.kind === "video" || localTrack.kind === "audio") {
            if (localTrack.kind === "video") {
                await this.unpublishLocalParticipantVideoTrack();
            } else if (localTrack.kind === "audio") {
                await this.unpublishLocalParticipantAudioTrack();
            }
            //console.log("currentTracks updated: " + localTracks);
            if (this.currentRoom && this.currentRoom.localParticipant) {
                //unpublish all tracks of the same kind only one track of each kind is allowed (1 audio, 1 video)
                for (let publication of this.currentRoom.localParticipant.tracks) {
                    const publicationTrack = publication[1];
                    if (publicationTrack.track.kind === localTrack.kind) {
                        publicationTrack.track.stop();
                        publicationTrack.unpublish();
                    }
                }
                await this.currentRoom.localParticipant.publishTrack(localTrack);
            }
            this.enableMicrophone(this.twilioMicEnable);//just in case we always update the mic state
            return new MediaStream([localTrack.mediaStreamTrack]);
        }
    }

    private async fetchAccessToken(): Promise<string> {
        let clientId: string = this.clientId, roomName: string = this.roomId;
        let apiUrl: string;
        if (!getAdapterParams().url) {
            const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/dbapi/adapter/twilio/profile";
            const resp = await fetch(url);
            const adapterParams = await resp.json();
            apiUrl = adapterParams.url;
        } else {
            apiUrl = getAdapterParams().url;
        }
        // Here we're constructing the identity by appending a random number to the clientId.
        // You might want to handle this differently depending on your application's requirements.
        clientId = clientId + "/" + Math.ceil(Math.random() * 10000);

        // Now we'll make the actual request to our token generation endpoint
        try {
            const response = await fetch(apiUrl + `?identity=${encodeURIComponent(clientId)}&roomName=${encodeURIComponent(roomName)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // You should handle the response format according to how your server sends the token.
            // Here we're assuming the server response is plain text.
            return await response.text();
        } catch (error) {
            console.error('Error fetching access token:', error);
            throw error; // Re-throw the error to handle it in the calling function
        }
    }

    async connectRoom(clientId: string, roomId: string): Promise<void> {
        this.disconnect();//disconnect before connecting
        this.clientId = clientId + "/" + Math.ceil(Math.random() * 10000);
        this.roomId = roomId;
        //console.log("Twilio Connect Room");
        // Join to the Room with the given AccessToken and ConnectOptions.
        const token = await this.fetchAccessToken();
        this.currentRoom = await Video.connect(token, {audio: false, video: false});
        (window as any).twilioroom = this.currentRoom;//used for debugging

        //sync inital state of the room
        this.currentRoom.participants.forEach(participant => {
            this.onTwilioParticipantConnected(participant);
        });
        //https://sdk.twilio.com/js/video/releases/2.8.0/docs/Room.html#event:disconnected
        this.currentRoom.on("participantConnected", participant => this.onTwilioParticipantConnected(participant));
        this.currentRoom.on('disconnected', (room, error) => {
            if (error) {
                console.error('Unexpectedly disconnected:', error);
                //try to reconnect
                this.connectRoom(clientId, roomId);
            } else {
                console.warn('Disconnected from Room with room name: ' + room.name);
            }
        });
        this.currentRoom.on("participantDisconnected", (participant) => this.onTwilioParticipantDisconnected(participant));
    }

    public setOnTrack(onTrack: (track: MediaStreamTrack, peerId: string, trackid: string) => void): void {
        this.onTrack = onTrack;
    }

    public setOnTrackRemoved(onTrackRemoved: (trackId: string) => void): void {
        this.onTrackRemoved = onTrackRemoved;
    }

    private onTwilioParticipantDisconnected(participant: Video.RemoteParticipant): void {
        //console.log(`Participant disconnected: ${participant.identity}`);
        let peerId = this.convertId(participant.identity);
        this.adapterUserListener.notifyUserLeave(peerId);
        participant.removeAllListeners();
    }

    private onTwilioParticipantConnected(participant: Video.RemoteParticipant): void {
        //console.log(`Participant connected: ${participant.identity}`);
        let peerId = this.convertId(participant.identity);
        this.adapterUserListener.notifyUserEnter(peerId);
        participant.tracks.forEach((publication: Video.RemoteTrackPublication) => {
            if (publication.isSubscribed) {
                if (publication.track.kind === "audio" || publication.track.kind === "video") {
                    const mediaStreamTrack = publication.track.mediaStreamTrack;
                    this.onTrack(mediaStreamTrack, peerId, publication.track.name);
                }
            }
            /**
             *   on(event: 'publishPriorityChanged', listener: (priority: Track.Priority) => void): this;
             *   on(event: 'subscribed', listener: (track: RemoteTrack) => void): this;
             *   on(event: 'subscriptionFailed', listener: (error: TwilioError) => void): this;
             *   on(event: 'trackSwitchedOff', listener: (track: RemoteTrack) => void): this;
             *   on(event: 'trackSwitchedOn', listener: (track: RemoteTrack) => void): this;
             *   on(event: 'unsubscribed', listener: (track: RemoteTrack) => void): this;
             */
            publication.on("unsubscribed", (track: Video.RemoteTrack) => {
                console.warn(`publication unsubscribed`, track);
            });
            publication.on("subscriptionFailed", error => {
                console.error(`publication subscriptionFailed`, error);
            });
            publication.on("trackSwitchedOff", (track: Video.RemoteTrack) => {
                console.warn(`publication trackSwitchedOff`, track);
            });
        });

        participant.on("trackSubscribed", (track: Video.RemoteTrack) => {
            if (track.kind === "audio" || track.kind === "video") {
                const mediaStreamTrack = track.mediaStreamTrack;
                let peerId = this.convertId(participant.identity);
                this.onTrack(mediaStreamTrack, peerId, track.name);
            }
        });
        participant.on("trackUnsubscribed", async (track) => {
            if (track.kind === "audio") {
                await this.unpublishGivenAudioTrack(track);
            } else if (track.kind === "video") {
                await this.unpublishGivenVideoTrack(track);
            }
            this.onTrackRemoved(track.name);
        });
        participant.on("trackPublished", track => {
            //console.log(`Participant trackPublished`, track);
        });
        participant.on("trackUnpublished", track => {
            console.warn(`Participant trackUnpublished`, track);
        });
    };

    public disconnect(): void {
        if (this.currentRoom) {
            this.currentRoom.disconnect();
            //remove listeners
            this.currentRoom.removeAllListeners();
        }
    }
}

