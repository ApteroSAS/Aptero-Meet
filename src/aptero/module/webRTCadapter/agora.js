import AgoraRTC from "agora-rtc-sdk-ng";
import { getAdapterConfig } from "./adapter-config";

export class AgoraAdapter {

  currentRoom = null;

  constructor(adapterUserListener) {
    this.adapterUserListener = adapterUserListener;
  }

  convertId(clientid) {
    return clientid.split("/")[0];
  }

  enableMicrophone(enabled) {
    if (this.currentRoom && this._micProducer) {
      const track = this._micProducer.getMediaStreamTrack();
      track.enabled=enabled;
    }
  }

  isMicEnabled() {
    if (!this._micProducer) {
      return false;
    }
    return this._micProducer.getMediaStreamTrack().enabled;
  }

  async disableCamera() {
    await this.unpublishVideoTrack();
  }

  async disableShare() {
    await this.unpublishVideoTrack();
  }

  async createTrack(constraints) {
    /*
        // Create tracks to the local microphone and camera.
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
     */
    let track;
    if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
      await this.unpublishVideoTrack();
      if (constraints.video.mediaSource === "camera") {
        //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartc.html#createcameravideotrack
        //https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/customvideotrackinitconfig.html
        track = await AgoraRTC.createCameraVideoTrack({ cameraId: constraints.video.deviceId?.exact[0] });
      } else {
        //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartc.html#createscreenvideotrack
        //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/screenvideotrackinitconfig.html
        track = await AgoraRTC.createScreenVideoTrack();
      }
      this._videoProducer = track;
    } else if (constraints.audio) {
      await this.unpublishAudioTrack();
      //https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/microphoneaudiotrackinitconfig.html
      track = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: constraints.audio.deviceId?.exact[0] });
      this._micProducer = track;
    }
    this.currentRoom.publish(track);
    return new MediaStream([track.getMediaStreamTrack()]);
  }

  async connectRoom(clientId, roomId) {
    clientId = clientId + "/" + Math.ceil(Math.random() * 10000);

    const roomName = roomId;
    const apiUrl = getAdapterConfig().url || window.location.origin + "/service/agora";
    const response1 = await fetch(apiUrl + `/appid`);
    const appID = await response1.text();
    const response2 = await fetch(apiUrl + `/token?identity=${clientId}&roomName=${roomName}`);
    const token = await response2.text();

    let room = AgoraRTC.createClient({
      mode: "rtc",
      codec: "vp8"
    });
    //https://docs.agora.io/en/faq/API%20Reference/web/interfaces/agorartc.client.html#join
    let uid = await room.join(appID, roomId, token, clientId);
    this.currentRoom = room;
    console.log(uid);
    //room.init(appID,() => console.log("AgoraRTC client initialized") ,(e)=> console.error("AgoraRTC client error",e) );

    let onParticipant = async (participant, mediaType) => {
      if (mediaType) {
        let peerId = this.convertId(participant.uid);
        await this.currentRoom.subscribe(participant, mediaType);
        if (participant.hasAudio && participant.audioTrack) {
          let track = participant.audioTrack;
          track.track = track.getMediaStreamTrack();
          this.onTrack(track, peerId, peerId + "-" + mediaType);
        }
        if (participant.hasVideo && participant.videoTrack) {
          let track = participant.videoTrack;
          track.track = track.getMediaStreamTrack();
          this.onTrack(track, peerId, peerId + "-" + mediaType);
        }
      }
    };
    this.currentRoom.on("user-joined", (participant, mediaType) => {
      //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartcremoteuser.html
      console.log(`Participant connected: ${participant.uid}`);
      let peerId = this.convertId(participant.uid);
      this.adapterUserListener(peerId);
      onParticipant(participant, mediaType);
    });
    this.currentRoom.on("user-published", (participant, mediaType) => {
      console.log(`Participant connected: ${participant.uid}`);
      onParticipant(participant, mediaType);
    });
    this.currentRoom.on("user-unpublished", (participant, mediaType) => {
      console.log(`Participant unpublished: ${participant.uid}`);
      let peerId = this.convertId(participant.uid);
      this.onTrackRemoved(peerId + "-" + mediaType);
    });
    this.currentRoom.on("user-left", participant => {
      console.log(`Participant disconnected: ${participant.identity}`);
      let peerId = this.convertId(participant.uid);
      this.adapterUserListener(peerId);
      this.onParticipantDisconnected(peerId);
    });
  }

  setOnTrack(onTrack) {
    this.onTrack = onTrack;
  }

  setOnTrackRemoved(onTrackRemoved) {
    this.onTrackRemoved = onTrackRemoved;
  }

  setOnParticipantDisconnected(onParticipantDisconnected) {
    this.onParticipantDisconnected = onParticipantDisconnected;
  }

  disconnect() {
    if (this.currentRoom) {
      this.currentRoom.leave();
    }
  }

  async unpublishAudioTrack() {
    if (this._micProducer) {
      await this.currentRoom.unpublish(this._micProducer);
      this._micProducer = null;
    }
  }

  async unpublishVideoTrack() {
    if (this._videoProducer) {
      await this.currentRoom.unpublish(this._videoProducer);
      this._videoProducer = null;
    }
  }
}