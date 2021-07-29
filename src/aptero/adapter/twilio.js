import configs from "../../utils/configs";
import * as Video from "twilio-video";
import { propertiesService } from "../properties/propertiesService";



//NOTE createLocalAudioTrack returns a LocalAudioTrack object that contains a MediaStreamTrack
/*
https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
The MediaStream interface represents a stream of media content. A stream
consists of several tracks such as video or audio tracks. Each track is
specified as an instance of MediaStreamTrack.You can obtain a MediaStream
object either by using the constructor or by calling */
export let currentRoom = null;
export let videoTrack = null;

export function convertId(twilioCLientId){
  return twilioCLientId.split("/")[0];
}

export async function unpublishVideoTrack() {
  if(videoTrack) {
    currentRoom.localParticipant?.unpublishTrack(videoTrack);
    videoTrack.stop();
    videoTrack = null;
  }
}

export async function createTwilioTrack(constraints) {
  let room = currentRoom;
  let track;
  if (constraints.video) { //First check if constraint video because we can have an audio constraint in case of a share screen
    if (constraints.video.mediaSource === "camera") {
      //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
      let localTracks = await Video.createLocalTracks(constraints);
      console.log("currentTracks updated: " + localTracks);
      if (room) {
        room.localParticipant?.publishTrack(localTracks[0]);
      }
      videoTrack = localTracks[0].mediaStreamTrack;
      return new MediaStream([videoTrack]);
    } else {
      //https://www.twilio.com/docs/video/javascript-v1-screen-capture-chrome
      let stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      let localTracks = await Video.LocalVideoTrack(stream.getTracks()[0]);
      console.log("currentTracks updated: " + localTracks);
      if (room) {
        room.localParticipant?.publishTrack(localTracks);
      }
      videoTrack = localTracks.mediaStreamTrack;
      return new MediaStream([videoTrack]);
    }
  }else if (constraints.audio) {
    //https://www.twilio.com/docs/video/javascript-v1-getting-started#specify-constraints
    let localTracks = await Video.createLocalTracks(constraints);
    console.log("currentTracks updated: " + localTracks);
    if (room) {
      room.localParticipant?.publishTrack(localTracks[0]);
    }
    return new MediaStream([localTracks[0].mediaStreamTrack]);
  }
  return new MediaStream([track.getMediaStreamTrack()]);
}

export async function connectRoom(clientId,roomId){
  clientId = clientId+"/"+Math.ceil(Math.random()*10000);
  console.log("Twilio Connect Room");
  const { connect, createLocalVideoTrack, Logger } = require('twilio-video');
  // Join to the Room with the given AccessToken and ConnectOptions.
  const roomName = roomId;
  let apiUrl;
  if(!configs.APP_CONFIG.adapterParams.url) {
    const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/twilio/profile";
    const resp = await fetch(url);
    const adapterParams = await resp.json();
    apiUrl = adapterParams.url;
  }else{
    apiUrl = configs.APP_CONFIG.adapterParams.url;
  }
  const response = await fetch(apiUrl+`?identity=${clientId}&roomName=${roomName}`);
  // Extract the AccessToken from the Response.
  const token = await response.text();
  const room = await connect(token,{audio:false,video:false});
  currentRoom = room;
  return room;
}

