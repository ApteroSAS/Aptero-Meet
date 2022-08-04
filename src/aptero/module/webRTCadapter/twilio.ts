import * as Video from "twilio-video";
import { propertiesService } from "../properties/propertiesService";
import { getAdapterParams } from "./adapter-config";

export class TwilioAdapter {
  currentRoom = null;
  videoTrack = null;
  twilioMicEnable = false;
  onTrack = (a:any,b:any,c:any) => {console.error("invalid")};
  private adapterUserListener: any;
  private onParticipantDisconnected: any;

  constructor(adapterUserListener) {
    this.adapterUserListener = adapterUserListener;
  }

  convertId(twilioCLientId) {
    return twilioCLientId.split("/")[0];
  }

  async unpublishGivenVideoTrack(track) {
    if (track) {
      const video = track._dummyEl;
      try {
        track.stop();
        track.detach();
        this.currentRoom.localParticipant.unpublishTrack(track);
      } catch (e) {/* happens in case of remote track*/
      }
      if (video) {
        video.pause();
        video.removeAttribute('src'); // empty source
        video.srcObject = null;
        video.load();
      }
      track._dummyEl = null;
      track = null;
    }
  }

  async unpublishVideoTrack() {
    for (let publication of this.currentRoom.localParticipant.videoTracks) {
      publication = publication[1];
      //if(publication.track === videoTrack){
      await this.unpublishGivenVideoTrack(publication.track);
      publication.unpublish();
      console.log('unpublish')
      //}
    }
    this.videoTrack = null
  }

  enableMicrophone(enabled) {
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

  isMicEnabled() {
    return this.twilioMicEnable;
  }

  async disableCamera() {
    await this.unpublishVideoTrack();
  }

  async disableShare() {
    await this.unpublishVideoTrack();
  }

  async createTrack(constraints) {
    console.log("createTwilioTrack");
    let room = this.currentRoom;
    if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
      await this.unpublishVideoTrack();
      if (constraints.video.mediaSource === "camera") {
        //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
        let localTracks:any = await Video.createLocalTracks(constraints);
        console.log("currentTracks updated: " + localTracks);
        if (room) {
          room.localParticipant?.publishTrack(localTracks[0]);
        }
        this.videoTrack = localTracks[0];
        return new MediaStream([localTracks[0].mediaStreamTrack]);
      } else {
        //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
        let stream = await navigator.mediaDevices.getDisplayMedia(constraints);
        let localTracks:any = await new Video.LocalVideoTrack(stream.getTracks()[0]);
        console.log("currentTracks updated: " + localTracks);
        if (room) {
          room.localParticipant?.publishTrack(localTracks);
        }
        this.videoTrack = localTracks;
        return new MediaStream([localTracks.mediaStreamTrack]);
      }
    } else if (constraints.audio) {
      await this.unpublishAudioTrack();
      //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
      let localTracks:any = await Video.createLocalTracks(constraints);
      console.log("currentTracks updated: " + localTracks);
      if (room) {
        room.localParticipant?.publishTrack(localTracks[0]);
      }
      return new MediaStream([localTracks[0].mediaStreamTrack]);
    }
  }

  async connectRoom(clientId, roomId) {
    clientId = clientId + "/" + Math.ceil(Math.random() * 10000);
    console.log("Twilio Connect Room");
    const { connect } = require('twilio-video');
    // Join to the Room with the given AccessToken and ConnectOptions.
    const roomName = roomId;
    let apiUrl;
    if (!getAdapterParams().url) {
      const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/twilio/profile";
      const resp = await fetch(url);
      const adapterParams = await resp.json();
      apiUrl = adapterParams.url;
    } else {
      apiUrl = getAdapterParams().url;
    }
    const response = await fetch(apiUrl + `?identity=${clientId}&roomName=${roomName}`);
    // Extract the AccessToken from the Response.
    const token = await response.text();
    const room = await connect(token, { audio: false, video: false });
    this.currentRoom = room;


    const onTwilioParticipant = participant => {
      console.log(`Participant connected: ${participant.identity}`);
      let peerId = this.convertId(participant.identity);
      this.adapterUserListener.notifyUserEnter(peerId);
      participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
          const track = publication.track;
          track.track = track.mediaStreamTrack;
          this.onTrack(track,peerId,track.name);
        }
        publication.on("subscribed", track => {
          console.log(`publication subscribed`, track);
        });
        publication.on("unsubscribed", track => {
          console.log(`publication unsubscribed`, track);
        });
      });

      participant.on("trackSubscribed", track => {
        let peerId = this.convertId(participant.identity);
        track.track = track.mediaStreamTrack;
        this.onTrack(track,peerId,track.name);
      });
      participant.on("trackUnsubscribed", track => {
        this.unpublishGivenVideoTrack(track);
        this.onTrackRemoved(track.name);
        console.log(`Participant trackUnsubscribed`, track);
      });
      participant.on("trackPublished", track => {
        console.log(`Participant trackPublished`, track);
      });
      participant.on("trackUnpublished", track => {
        console.log(`Participant trackUnpublished`, track);
      });
    };
    this.currentRoom.participants.forEach(participant => {
      onTwilioParticipant(participant);
    });
    this.currentRoom.on("participantConnected", onTwilioParticipant);

    this.currentRoom.on("participantDisconnected", participant => {
      console.log(`Participant disconnected: ${participant.identity}`);
      let peerId = this.convertId(participant.identity);
      this.adapterUserListener.notifyUserLeave(peerId);
      this.onParticipantDisconnected(peerId);
    });
  }

  setOnTrack(onTrack){
    this.onTrack = onTrack;
  }

  setOnTrackRemoved(onTrackRemoved){
    this.onTrackRemoved = onTrackRemoved;
  }

  setOnParticipantDisconnected(onParticipantDisconnected){
    this.onParticipantDisconnected = onParticipantDisconnected;
  }

  disconnect(){
    if(this.currentRoom) {
      this.currentRoom.disconnect();
    }
  }

  async unpublishAudioTrack() {
    for (let publication of this.currentRoom.localParticipant.tracks) {
      publication = publication[1];
      if(publication.track.kind === "audio"){
        publication.track.stop()
        publication.unpublish();
        console.log('unpublish audio')
      }
    }
    this.videoTrack = null
  }

  private onTrackRemoved(name) {

  }
}

