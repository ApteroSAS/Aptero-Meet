import configs from "../../utils/configs";

let forceTurnGlobal = false;
let forceTcpGlobal = false;

const AccountSID = "AC2b4884e41acc8b8ed9f7ee795969d76";
import * as Video from 'twilio-video';

//NOTE createLocalAudioTrack returns a LocalAudioTrack object that contains a MediaStreamTrack
/*
https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
The MediaStream interface represents a stream of media content. A stream
consists of several tracks such as video or audio tracks. Each track is
specified as an instance of MediaStreamTrack.You can obtain a MediaStream
object either by using the constructor or by calling */
let currentRoom;

export function convertId(twilioCLientId){
  return twilioCLientId.split("/")[0];
}

export async function connectRoom(clientId,roomId){
  clientId = clientId+"/"+Math.ceil(Math.random()*10000);
  console.log("Twilio Connect Room");
  const { connect, createLocalVideoTrack, Logger } = require('twilio-video');
  // Join to the Room with the given AccessToken and ConnectOptions.
  const roomName = "test2";//this._roomId
  const apiUrl = "https://alphahub.aptero.co/service/twilio/token";
  const response = await fetch(apiUrl+`?identity=${clientId}&roomName=${roomName}`);
  // Extract the AccessToken from the Response.
  const token = await response.text();
  const room = await connect(token,{audio:false,video:false});
  currentRoom = room;
  return room;
}

export async function createTrack(constraints){
  if(constraints.video){
    delete constraints["audio"];
  }
  if(configs.APP_CONFIG.adapter === "twilio"){
    let room = currentRoom;
    return Video.createLocalTracks(constraints).then(localTracks => {
      console.log("currentTracks updated: "+localTracks);
      if(room) {
        room.localParticipant?.publishTrack(localTracks[0])
      }
      return new MediaStream([localTracks[0].mediaStreamTrack]);
    })
  }else{
    return navigator.mediaDevices.getUserMedia(constraints);//Type MediaStream
  }
}

export async function createVideoTrack(){
  let room = currentRoom;
  Video.createLocalTracks({
    audio: true
  }).then(localTracks => {
    console.log("currentTracks updated: "+localTracks);
    if(room) {
      room.localParticipant?.publishTrack(localTracks[0])
    }
  })
}

export async function fetchICEservers() {
  window.iceServers = [];
  try{
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Basic U0tjYzMxZDM0N2YxOGVlYmM3MjNiMDgzNTc0ZTE2MWJjMDp6bFM1TjNmbGhWMEdOc0ZLcG1vbFBucW1TcWdMbEliNQ=="
    );

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow"
    };
    const twilioApi = "https://api.twilio.com/2010-04-01/Accounts/"+AccountSID+"/Tokens.json";
    const resp = await fetch(twilioApi, requestOptions);
    const servers = await resp.json();
    window.iceServers = [...servers.ice_servers];
  }catch(error){
    //just log not app break this is optional
    console.error(error);
  }
  return window.iceServers;
}

export function filterServer(iceServers,forceTcp){
  //Remove double stun
  let stunCount = 0;
  iceServers = iceServers.filter(server => {
    let isStun = server.urls.search("stun") !== -1
    if(isStun){
      stunCount++;
    }
    return !isStun || (isStun && stunCount<=1);
  });
  //remove udp server in case of force tcp
  if(forceTcp) {
    iceServers = iceServers.filter(server => {
      let isUdp = server.urls.search("turn") !== -1 && server.urls.search("udp") !== -1;
      return !isUdp;
    });
  }
  //remove tcp server
  if(!forceTcp) {
    iceServers = iceServers.filter(server => {
      let isTcp = server.urls.search("turn") !== -1 && server.urls.search("tcp") !== -1;
      return !isTcp;
    });
  }
  return iceServers;
}

export function addIceServers(iceServer) {
  iceServer = [];
  window.iceServers.forEach(server => {
    iceServer.unshift(server);
  });
  iceServer = filterServer(iceServer,forceTcpGlobal);
  console.log(iceServer);
  return iceServer;
}

export function configureTurn(forceTurn,forceTcp,adapter) {
  forceTurnGlobal = !!forceTurn;
  forceTcpGlobal = !!forceTcp;
  let peerConnectionConfig = adapter.peerConnectionConfig || {};
  peerConnectionConfig.iceServers = window.iceServers || peerConnectionConfig.iceServers; //APTERO
  peerConnectionConfig.iceServers = filterServer(peerConnectionConfig.iceServers,forceTcp);
  if(adapter.setPeerConnectionConfig) {
    adapter.setPeerConnectionConfig(peerConnectionConfig);
  }
}