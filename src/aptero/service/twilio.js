
let forceTurnGlobal = false;
let forceTcpGlobal = false;

const AccountSID = "AC2b4884e41acc8b8ed9f7ee795969d76";

export async function fetchICEservers() {
  window.iceServers = [];
  try{b
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