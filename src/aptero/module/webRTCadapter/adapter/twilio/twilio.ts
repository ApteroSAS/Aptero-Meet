import * as Video from "twilio-video";
import {propertiesService} from "../../../properties/propertiesService";
import {getAdapterParams} from "../../adapter-config";
import AdapterUserListener from "../../AdapterUserListener";

export class TwilioAdapter {
    private currentRoom :Video.Room = null;
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

    constructor(adapterUserListener:AdapterUserListener) {
        this.adapterUserListener = adapterUserListener;
    }

    private convertId(twilioClientId: string) {
        return twilioClientId.split("/")[0];
    }

    private async unpublishGivenVideoTrack(track:Video.LocalVideoTrack|Video.RemoteVideoTrack) {
        if (track) {
            if(track instanceof Video.LocalVideoTrack) {
                track.stop();
            }
            track.detach();
            this.currentRoom.localParticipant.unpublishTrack(track.mediaStreamTrack);
        }
    }

    public async unpublishVideoTrack() {
        for (let publication of this.currentRoom.localParticipant.videoTracks) {
            const publicationTrack = publication[1];
            await this.unpublishGivenVideoTrack(publicationTrack.track);
            publicationTrack.unpublish();
        }
    }

    public enableMicrophone(enabled: boolean) {
        //console.log("mic :",enabled)
        if (this.currentRoom) {
            if (enabled) {
                this.currentRoom.localParticipant.audioTracks.forEach(publication => {
                    publication.track.enable();
                });
            } else {
                this.currentRoom.localParticipant.audioTracks.forEach(publication => {
                    publication.track.disable();
                });
            }
        }
        this.twilioMicEnable = enabled;
    }

    public isMicEnabled(): boolean {
        return this.twilioMicEnable;
    }

    public async createTrack(constraints:MediaStreamConstraints): Promise<MediaStream> {
        //console.log("createTwilioTrack");
        if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
            await this.unpublishVideoTrack();
            if ((constraints.video as any).mediaSource === "camera") {
                //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
                let localTracks = await Video.createLocalTracks(constraints);
                const localTrack = localTracks[0];
                if(localTrack.kind === "video") {
                    //console.log("currentTracks updated: " + localTracks);
                    if (this.currentRoom) {
                        await this.currentRoom.localParticipant?.publishTrack(localTrack);
                    }
                    return new MediaStream([localTrack.mediaStreamTrack]);
                } else {
                    throw new Error("createLocalTracks returned a non video track");
                }
            } else {
                //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
                let stream = await navigator.mediaDevices.getDisplayMedia(constraints);
                let localTrack = new Video.LocalVideoTrack(stream.getTracks()[0]);
                //console.log("currentTracks updated: " + localTracks);
                if (this.currentRoom) {
                    await this.currentRoom.localParticipant?.publishTrack(localTrack);
                }
                return new MediaStream([localTrack.mediaStreamTrack]);
            }
        } else if (constraints.audio) {
            await this.unpublishAudioTrack();
            //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
            let localTrack = await Video.createLocalAudioTrack(constraints.audio as any);
            //console.log("currentTracks updated: " + localTracks);
            if (this.currentRoom) {
                await this.currentRoom.localParticipant.publishTrack(localTrack);
            }
            this.enableMicrophone(this.twilioMicEnable);
            return new MediaStream([localTrack.mediaStreamTrack]);
        }
    }

    private async fetchAccessToken(): Promise<string> {
        let clientId: string = this.clientId, roomName: string = this.roomId;
        let apiUrl: string;
        if (!getAdapterParams().url) {
            const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/twilio/profile";
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

    async connectRoom(clientId: string, roomId: string):Promise<void>{
        this.disconnect();//disconnect before connecting
        this.clientId = clientId + "/" + Math.ceil(Math.random() * 10000);
        this.roomId = roomId;
        //console.log("Twilio Connect Room");
        // Join to the Room with the given AccessToken and ConnectOptions.
        const token = await this.fetchAccessToken();
        this.currentRoom = await Video.connect(token, {audio: false, video: false});
        (window as any).twilioroom = this.currentRoom;//used for debugging


        this.currentRoom.participants.forEach(participant => {
            this.onTwilioParticipantConneted(participant);
        });
        //https://sdk.twilio.com/js/video/releases/2.8.0/docs/Room.html#event:disconnected
        this.currentRoom.on("participantConnected", participant => this.onTwilioParticipantConneted(participant));
        this.currentRoom.on('disconnected', (room, error) => {
            if (error) {
                console.error('Unexpectedly disconnected:', error);
                //try to reconnect
                this.connectRoom(clientId, roomId);
            }
        });
        this.currentRoom.on("participantDisconnected", (participant) => this.onTwilioParticipantDisconnected(participant));
    }

    public setOnTrack(onTrack: (track:MediaStreamTrack, peerId:string, trackid:string) => void):void {
        this.onTrack = onTrack;
    }

    public setOnTrackRemoved(onTrackRemoved:(trackId:string)=>void):void {
        this.onTrackRemoved = onTrackRemoved;
    }

    private onTwilioParticipantDisconnected(participant:Video.RemoteParticipant):void{
        //console.log(`Participant disconnected: ${participant.identity}`);
        let peerId = this.convertId(participant.identity);
        this.adapterUserListener.notifyUserLeave(peerId);
        participant.removeAllListeners();
    }

    private onTwilioParticipantConneted(participant:Video.RemoteParticipant):void {
        //console.log(`Participant connected: ${participant.identity}`);
        let peerId = this.convertId(participant.identity);
        this.adapterUserListener.notifyUserEnter(peerId);
        participant.tracks.forEach((publication:Video.RemoteTrackPublication) => {
            if (publication.isSubscribed) {
                if(publication.track.kind === "audio" || publication.track.kind === "video") {
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
            publication.on("unsubscribed", (track:Video.RemoteTrack) => {
                console.warn(`publication unsubscribed`, track);
            });
            publication.on("subscriptionFailed", error => {
                console.error(`publication subscriptionFailed`, error);
            });
            publication.on("trackSwitchedOff", (track:Video.RemoteTrack) => {
                console.warn(`publication trackSwitchedOff`, track);
            });
        });

        participant.on("trackSubscribed", (track:Video.RemoteTrack) => {
            if(track.kind === "audio" || track.kind === "video") {
                const mediaStreamTrack = track.mediaStreamTrack;
                let peerId = this.convertId(participant.identity);
                this.onTrack(mediaStreamTrack, peerId, track.name);
            }
        });
        participant.on("trackUnsubscribed", async (track) => {
            if(track.kind === "audio") {
                await this.unpublishAudioTrack();
            }else if(track.kind === "video") {
                await this.unpublishGivenVideoTrack(track);
            }
            this.onTrackRemoved(track.name);
        });
        participant.on("trackPublished", track => {
            //console.log(`Participant trackPublished`, track);
        });
        participant.on("trackUnpublished", track => {
            console.log(`Participant trackUnpublished`, track);
        });
    };

    public disconnect():void {
        if (this.currentRoom) {
            this.currentRoom.disconnect();
            //remove listeners
            this.currentRoom.removeAllListeners();
        }
    }

    private async unpublishAudioTrack() : Promise<void> {
        for (let publication of this.currentRoom.localParticipant.tracks) {
            const publicationTrack = publication[1];
            if (publicationTrack.track.kind === "audio") {
                publicationTrack.track.stop()
                publicationTrack.unpublish();
                //console.log('unpublish audio')
            }
        }
    }
}

