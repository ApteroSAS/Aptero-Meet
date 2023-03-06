/* global APP*/
import { getReticulumFetchUrl, hubUrl } from "./utils/phoenix-utils";
import { updateEnvironmentForHub, updateUIForHub, remountUI } from "./hub";

function unloadRoomObjects() {
  document.querySelectorAll("[pinnable]").forEach(el => {
    if (el.components.pinnable.data.pinned) {
      el.parentNode.removeChild(el);
    }
  });

  document.querySelectorAll(".drawing").forEach(el => {
    el.parentNode.removeChild(el);
  });

  document.querySelectorAll(".interactable").forEach(el => {
    if (!el.components.pinnable && el.id!=="pen-spawner") {
      el.parentNode.removeChild(el);
    }
  });

  // Clean up empty object.gltf nodes
  document.querySelectorAll("#objects-scene .Room_Objects").forEach(el => {
    if (!el.children.length) {
      el.parentNode.parentNode.removeChild(el.parentNode);
    }
  });
}

function loadRoomObjects(hubId) {
  const objectsScene = document.querySelector("#objects-scene");
  const objectsUrl = getReticulumFetchUrl(`/${hubId}/objects.gltf`);
  const objectsEl = document.createElement("a-entity");
  objectsEl.setAttribute("gltf-model-plus", { src: objectsUrl, useCache: false, inflate: true });
  objectsScene.appendChild(objectsEl);
}

export async function changeHub(hubId, addToHistory = true, waypoint = null) {
  if (hubId === APP.hub.hub_id) {
    console.log("Change hub called with the current hub id. This is a noop.");
    return;
  }
  // Suppress on-screen join and leave messages until we receive a sync.
  APP.hideHubPresenceEvents = true;
  const scene = AFRAME.scenes[0];


  let data;
  try {
    data = await APP.hubChannel.migrateToHub(hubId);
  } catch (e) {
    console.warn(`Failed to join hub ${hubId}: ${e.reason}|${e.message}`);
    APP.messageDispatch.log("joinFailed", { message: e.message });
    return;
  }

  const hub = data.hubs[0];

  if (addToHistory) {
    //Aptero
    const extraParams = {};
    const searchParams = new URL(window.location).searchParams;
    for (const key of searchParams.keys()) {
      if(["hub_id","vr_entry_type"].indexOf(key)!==-1){
        continue;//skip specific params
      }
      extraParams[key] = searchParams.get(key);
    }
    window.history.pushState(null, null, hubUrl(hubId, extraParams, hub.slug, waypoint));
  }

  APP.hub = hub;
  await updateUIForHub(hub, APP.hubChannel);
  scene.emit("hub_updated", { hub });

  APP.subscriptions.setSubscribed(data.subscriptions.web_push);

  remountUI({
    hubIsBound: data.hub_requires_oauth,
    initialIsFavorited: data.subscriptions.favorites
  });

  await APP.dialog.disconnect();

  //Naf Disconnect see NAF.connection.disconnect();
  //We do not disconnect at connection level to keep the adapter
  NAF.connection.entities.removeRemoteEntities();
  NAF.connection.adapter.disconnect();
  NAF.connection.connectedClients = {};
  NAF.connection.activeDataChannels = {};
  NAF.connection.setupDefaultDataSubscriptions();
  document.body.removeEventListener('connected', NAF.connection.onConnectCallback);

  unloadRoomObjects();//unload object after NAF is fully disconnected

  const fader = document.getElementById("viewing-camera").components["fader"];
  await fader.fadeOut();

  scene.emit("reset_scene");
  //update environment before connecting the network adapter to prevent visible invisible elements issue
  await updateEnvironmentForHub(hub, APP.entryManager);//Note a priori c'est ce truc qui pose problem

  APP.retChannel.push("change_hub", { hub_id: hub.hub_id });

  NAF.room = hub.hub_id;

  loadRoomObjects(hubId); // load object before NAF reconnection

  await Promise.all([
    APP.dialog.connect({
      serverUrl: `wss://${hub.host}:${hub.port}`,
      roomId: hub.hub_id,
      joinToken: data.perms_token,
      serverParams: { host: hub.host, port: hub.port, turn: hub.turn },
      scene,
      clientId: APP.dialog._clientId,
      forceTcp: APP.dialog._forceTcp,
      forceTurn: APP.dialog._forceTurn,
      iceTransportPolicy: APP.dialog._iceTransportPolicy
    }),
    NAF.connection.adapter.connect()
  ]);


  await APP.hubChannel.sendEnteredEvent();

  APP.messageDispatch.receive({
    type: "hub_changed",
    hubName: hub.name,
    showLineBreak: true
  });
}
window.changeHub = changeHub;

// TODO see if there is a better way to do this with react router
//https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
window.addEventListener("popstate", function() {
  if(!APP.hub){
    console.warn("No APP.hub");
    return;
  }
  const qs = new URLSearchParams(location.search);
  const newHubId = qs.get("hub_id") || document.location.pathname.substring(1).split("/")[0];
  if (newHubId !== APP.hub.hub_id) {
    if (!window.APP_PROPS.APP_CONFIG.features.fast_room_switching) return;
    changeHub(newHubId, false);
  }
});
