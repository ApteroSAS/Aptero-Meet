import configs from "../../../utils/configs";
import { lazyLoad } from "./adapterRegistrer";
import { propertiesService } from "../properties/propertiesService";
import type NafTwilioAdapter from "./naf-twilio-adapter";

let defaultAdapter = configs.APP_CONFIG.adapterParams.adapter;

// eslint-disable-next-line no-unused-vars
let forceTurnGlobal = false;
let forceTcpGlobal = false;
let profile = null;

//https://github.com/networked-aframe/networked-aframe
const adapterList = ["wseasyrtc", "easyrtc", "janus", "socketio", "webrtc", "Firebase", "uWS", "dialog", "dialog-io", "agora", "twilio", "none", "dialog-io-data-only"];

declare const window: any;
declare const AFRAME: any;

let notifyReady;
const ready = new Promise<any>((resolve) => {
  notifyReady = resolve;
});

export async function adapterReady() {
  return await ready;
}

export function getAdapterParams(): {
  adapter: string,//dialog,dialog-io,janus,twilio,agora,default,none,socketio
  transport: string,
  url?: string
} {
  return profile || {};
}

export async function choseAdapter(adapter) {
  configs.APP_CONFIG.adapterParams.adapter = adapter;
  //fetch profile
  try {
    const url = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER + "/service/room/adapter/" + adapter + "/profile";
    const resp = await fetch(url);
    const recvProfile = await resp.json();
    profile = { ...(configs.APP_CONFIG.adapterParams || {}), ...recvProfile };
  } catch (err) {
    console.error(err);
  }
  if (!adapterList.includes(adapter)) {
    console.error("invalid adapter selected :", { adapter, adapterList });
  }
  await lazyLoad(adapter);
  return adapter;
}

export async function choseAdapterAuto() {
  let adapter = defaultAdapter;
  //compute right adapter
  if (configs.APP_CONFIG.adapterParams.adapter) {
    adapter = configs.APP_CONFIG.adapterParams.adapter;
  }
  if (new URL(window.location.href).searchParams.get("offline2")) {
    adapter = "none";
  }
  if (adapter === "default") {
    adapter = defaultAdapter;
  }
  const qs = new URLSearchParams(location.search);
  const msmode = !!qs.get("msteams");
  //const {msTeamsAPILight} = await import("@aptero/axolotis-module-team");
  //if(msTeamsAPILight().msTeams()){
  if (msmode) {
    adapter = "none";
  }

  let ret = await choseAdapter(adapter);
  notifyReady();
  return ret;
}

export async function adapterFactory() {
  const adapter = await choseAdapterAuto();
  const module = await lazyLoad(adapter);
  return new module.default();
}

export async function unpublishVideoTrack() {
  const adapterParams = getAdapterParams();
  if (adapterParams.adapter === "twilio" || adapterParams.adapter === "agora") {
    await window.APP.dialog.subAdapter.unpublishVideoTrack();
  }
}

export async function setlistenerEndShareVideo() {
  AFRAME.scenes[0].addEventListener("action_end_video_sharing", () => {
    unpublishVideoTrack();
  });
}

export async function createTrack(constraints, isDisplayDevice) {
  console.log("createTrack :", constraints, isDisplayDevice);
  const adapterParams = getAdapterParams();
  if (adapterParams.adapter === "twilio" || adapterParams.adapter === "agora") {
    return (window.APP.dialog as NafTwilioAdapter).createTrack(constraints);
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
  //To test chrome://webrtc-internals/
  window.iceServers = [];
  try {
    const twilioApi = propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER +"/service/twilio/ice";
    const resp = await fetch(twilioApi);
    const servers = await resp.json();
    console.log("WebRTC ICE", servers);
    window.iceServers = [...servers.iceServers];
  } catch (error) {
    //just log no app break this is optional
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
  /*if (!forceTcp) {
    iceServers = iceServers.filter(server => {
      let isTcp = server.urls.search("turn") !== -1 && server.urls.search("tcp") !== -1;
      return !isTcp;
    });
  }*/
  console.log("WebRTC Filtered : ", iceServers)
  return iceServers;
}

export function addIceServers(iceServer) {
  window.iceServers.forEach(server => {
    iceServer.unshift(server);
  });
  iceServer = filterServer(iceServer, forceTcpGlobal);
  console.log("WebRTC", iceServer);
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
