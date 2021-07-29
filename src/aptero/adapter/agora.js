import AgoraRTC from "agora-rtc-sdk-ng";
import { getAdapterConfig } from "./adapter-config";


//NOTE createLocalAudioTrack returns a LocalAudioTrack object that contains a MediaStreamTrack
/*
https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
The MediaStream interface represents a stream of media content. A stream
consists of several tracks such as video or audio tracks. Each track is
specified as an instance of MediaStreamTrack.You can obtain a MediaStream
object either by using the constructor or by calling */
export let currentRoom = null;

export function convertId(clientid) {
  return clientid.split("/")[0];
}

export async function createAgoraTrack(constraints) {
  /*
      // Create tracks to the local microphone and camera.
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack()
   */
  let track;
  if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
    if (constraints.video.mediaSource === "camera") {
      //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartc.html#createcameravideotrack
      //https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/customvideotrackinitconfig.html
      track = await AgoraRTC.createCameraVideoTrack({ cameraId: constraints.video.deviceId?.exact[0] });
    } else {
      //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/iagorartc.html#createscreenvideotrack
      //https://docs.agora.io/en/Voice/API%20Reference/web_ng/interfaces/screenvideotrackinitconfig.html
      track = await AgoraRTC.createScreenVideoTrack();
    }
  }else if (constraints.audio) {
    //https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/microphoneaudiotrackinitconfig.html
    track = await AgoraRTC.createMicrophoneAudioTrack({ microphoneId: constraints.audio.deviceId?.exact[0] });
  }
  return new MediaStream([track.getMediaStreamTrack()]);
}

export async function connectAgoraRoom(clientId, roomId) {
  clientId = clientId + "/" + Math.ceil(Math.random() * 10000);

  const roomName = roomId;
  const apiUrl = getAdapterConfig().url || window.location.origin+"/service/agora";
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
  console.log(uid);
  //room.init(appID,() => console.log("AgoraRTC client initialized") ,(e)=> console.error("AgoraRTC client error",e) );
  return room;
}

