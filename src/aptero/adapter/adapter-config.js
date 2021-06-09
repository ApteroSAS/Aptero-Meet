import configs from "../../utils/configs";
import { lazyLoad } from "./adapterRegistrer";
import { propertiesService } from "../properties/propertiesService";

let defaultAdapter = configs.APP_CONFIG.adapterParams.adapter;

let forceTurnGlobal = false;
let forceTcpGlobal = false;

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
    configs.APP_CONFIG.adapterParams = { ...(configs.APP_CONFIG.adapterParams), ...(await resp.json()) };
  } catch (err) {
    console.error(err);
  }
  await lazyLoad(adapter);
  return adapter;
}

export function getAdapterConfig() {
  return configs.APP_CONFIG.adapterParams || {};
}

export async function createTrack(constraints, isDisplayDevice) {
  if (constraints.video) {
    delete constraints["audio"];
  }
  if (configs.APP_CONFIG.adapterParams.adapter === "twilio") {
    let { createTwilioTrack:createTwilioTrack } = await import('./twilio');
    return createTwilioTrack(constraints, isDisplayDevice);
  } else if (configs.APP_CONFIG.adapterParams.adapter === "agora") {
    let { createAgoraTrack:createAgoraTrack } = await import('./agora');
    return createAgoraTrack(constraints, isDisplayDevice);
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
  console.log(iceServer);
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