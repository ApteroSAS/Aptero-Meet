import configs from "../../utils/configs";
import { lazyLoad } from "./adapterRegistrer";
import { propertiesService } from "../properties/propertiesService";

let defaultAdapter = configs.APP_CONFIG.adapterParams.adapter;

let forceTurnGlobal = false;
let forceTcpGlobal = false;
let profile = null;

//https://github.com/networked-aframe/networked-aframe
const adapterList = ["wseasyrtc","easyrtc","janus","socketio","webrtc","Firebase","uWS","dialog","dialog-io","agora","twilio","none","dialog-io-data-only"];

export async function choseAdapter() {
  let adapter = defaultAdapter;
  //compute right adapter
  if (configs.APP_CONFIG.adapterParams.adapter) {
    adapter = configs.APP_CONFIG.adapterParams.adapter;
  }
  if(new URL(window.location.href).searchParams.get("offline2")){
    adapter="none";
  }
  if(adapter==="default"){
    adapter = defaultAdapter;
  }
  configs.APP_CONFIG.adapterParams.adapter = adapter;
  //fetch profile
  try {
    const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/" + adapter + "/profile";
    const resp = await fetch(url);
    const recvProfile = await resp.json();
    profile = { ...(configs.APP_CONFIG.adapterParams), ...recvProfile };
    configs.APP_CONFIG.adapterParams = profile;
  } catch (err) {
    console.error(err);
  }
  if(!adapterList.includes(adapter)){
    console.error("invalid adapter selected :",{adapter,adapterList});
  }
  await lazyLoad(adapter);
  return adapter;
}

export async function adapterFactory(){
  const adapter = await choseAdapter();
  const module = await lazyLoad(adapter);
  return new module.default();
}

export function getAdapterConfig() {
  return profile || {};
}

export async function unpublishVideoTrack() {
  if (configs.APP_CONFIG.adapterParams.adapter === "twilio") {
    let { unpublishVideoTrack:unpublishVideoTrack } = await import('./twilio');
    await unpublishVideoTrack();
  }
}
export async function setlistenerEndShareVideo(){
  AFRAME.scenes[0].addEventListener("action_end_video_sharing", () => {
    unpublishVideoTrack();
  });
}

export async function createTrack(constraints, isDisplayDevice) {
  console.log("createTrack")
  const adapterParams = getAdapterConfig();
  if (adapterParams.adapter === "twilio" || adapterParams.adapter === "agora") {
    return window.APP.dialog.subAdapter.createTrack(constraints, isDisplayDevice);
  } else {
    if (isDisplayDevice) {
      return await navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
      try {
        return await navigator.mediaDevices.getUserMedia(constraints);//Type MediaStream
      } catch (err) {
        delete constraints.audio["deviceId"];
        return navigator.mediaDevices.getUserMedia(constraints);//Type MediaStream
      }
    }
  }
}

export async function fetchICEservers() {
  window.iceServers = [];
  try {
    const myHeaders = new Headers();
    myHeaders.append(
        "Authorization",
        "Basic " + configs.APP_CONFIG.turn.twilio.auth
    );

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow"
    };
    const twilioApi = "https://api.twilio.com/2010-04-01/Accounts/" + configs.APP_CONFIG.turn.twilio.SID + "/Tokens.json";
    const resp = await fetch(twilioApi, requestOptions);
    const servers = await resp.json();
    window.iceServers = [...servers.ice_servers];
  } catch (error) {
    //just log not app break this is optional
    console.error(error);
  }
  return window.iceServers;
}

export function filterServer(iceServers, forceTcp) {
  //Remove double stun
  let stunCount = 0;
  iceServers = iceServers.filter(server => {
    let isStun = server.urls.search("stun") !== -1;
    if (isStun) {
      stunCount++;
    }
    return !isStun || (isStun && stunCount <= 1);
  });
  //remove udp server in case of force tcp
  if (forceTcp) {
    iceServers = iceServers.filter(server => {
      let isUdp = server.urls.search("turn") !== -1 && server.urls.search("udp") !== -1;
      return !isUdp;
    });
  }
  //remove tcp server
  if (!forceTcp) {
    iceServers = iceServers.filter(server => {
      let isTcp = server.urls.search("turn") !== -1 && server.urls.search("tcp") !== -1;
      return !isTcp;
    });
  }
  return iceServers;
}

export function addIceServers(iceServer) {
  window.iceServers.forEach(server => {
    iceServer.unshift(server);
  });
  iceServer = filterServer(iceServer, forceTcpGlobal);
  console.log("WebRTC",iceServer);
  return iceServer;
}

export function configureTurn(forceTurn, forceTcp, adapter) {
  forceTurnGlobal = !!forceTurn;
  forceTcpGlobal = !!forceTcp;
  let peerConnectionConfig = adapter.peerConnectionConfig || {};
  peerConnectionConfig.iceServers = window.iceServers || peerConnectionConfig.iceServers; //APTERO
  peerConnectionConfig.iceServers = filterServer(peerConnectionConfig.iceServers, forceTcp);
  if (adapter.setPeerConnectionConfig) {
    adapter.setPeerConnectionConfig(peerConnectionConfig);
  }
}
