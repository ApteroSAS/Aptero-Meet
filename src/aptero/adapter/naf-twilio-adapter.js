import { debug as newDebug } from "debug";
import { connectRoom, convertId, unpublishGivenVideoTrack, unpublishVideoTrack } from "./twilio";
import EventEmitter from "eventemitter3";
import { ProtooHelper } from "./protoHelper";

// NOTE this adapter does not properly fire the onOccupantsReceived events since those are only needed for
// data channels, which are not yet supported. To fire that event, this class would need to keep a list of
// occupants around and manage it.
//
// Used for VP9 webcam video.

let debug = console.log;
let error = console.error;
let info = console.log;
if(newDebug){
  debug = newDebug("twilio-adapter:debug");
  //const warn = newDebug("naf-dialog-adapter:warn");
  error = newDebug("twilio-adapter:error");
	info = newDebug("twilio-adapter:info");
}

const INITIAL_ROOM_RECONNECTION_INTERVAL = 2000;


export default class NafTwilioAdapter extends EventEmitter {
  constructor() {
    super();

    this._timeOffsets = [];
    this._occupants = {};
    this._micProducer = null;
    this._videoProducer = null;
    this._mediaStreams = {};
    this._localMediaStream = null;
    this._consumers = new Map();
    this._frozenUpdates = new Map();
    this._pendingMediaRequests = new Map();
    this._micEnabled = true;
    this._initialAudioConsumerPromise = null;
    this._initialAudioConsumerResolvers = new Map();
    this._serverTimeRequests = 0;
    this._avgTimeOffset = 0;
    this._blockedClients = new Map();
    this.type = "twilio";
    this.occupants = {}; // This is a public field
    this._forceTcp = false;
    this._forceTurn = false;
    this._iceTransportPolicy = "all";
    this._reconnectionDelay = INITIAL_ROOM_RECONNECTION_INTERVAL;
    this._reconnectionTimeout = null;
    this._reconnectionAttempts = 0;
    this._lastSendConnectionState = null;
    this._lastRecvConnectionState = null;
    this._closed = true;
    this.scene = document.querySelector("a-scene");
  }

  get serverUrl() {
    return this._serverUrl;
  }

  setServerUrl(url) {
    this._serverUrl = url;
  }

  setServerParams(params) {
    this._serverParams = params;
  }

  setJoinToken(joinToken) {
    this._joinToken = joinToken;
  }

  setTurnConfig(forceTcp, forceTurn) {
    this._forceTcp = forceTcp;
    this._forceTurn = forceTurn;

    if (this._forceTurn || this._forceTcp) {
      this._iceTransportPolicy = "relay";
    }
  }

  setApp() {
  }

  setApp() {}

  setRoom(roomId) {
    this._roomId = roomId;
  }

  setClientId(clientId) {
    this._clientId = clientId;
  }

  setServerConnectListeners(successListener, failureListener) {
    this._connectSuccess = successListener;
    this._connectFailure = failureListener;
  }

  setRoomOccupantListener(occupantListener) {
    this._onOccupantsChanged = occupantListener;
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    this._onOccupantConnected = openListener;
    this._onOccupantDisconnected = closedListener;
    this._onOccupantMessage = messageListener;
  }

  /**
   * Gets transport/consumer/producer stats on the server side.
   */
  async getServerStats() {
    return {};
  }

  async iceRestart() {
  }

  async recreateSendTransport() {
  }

  async restartSendICE() {
  }

  checkSendIceStatus() {
  }

  async recreateRecvTransport() {
  }

  async restartRecvICE() {
  }

  checkRecvIceStatus() {
  }

  async connect() {
    this._twilioroom = await connectRoom(this._clientId,this._roomId);
    const onTwilioParticipant = participant => {
      console.log(`Participant connected: ${participant.identity}`);
      let onTrack = (track)=>{
        //RemoteAudioTrack
        let peerId = convertId(participant.identity);
        let kind = track.kind;
        console.log(" Add consumer:",track);
        track.appData = {peerId};
        track.track = track.mediaStreamTrack;
        this._consumers.set(track.name, track);
        this.resolvePendingMediaRequestForTrack(peerId, track.track);

        if (kind === "audio") {
          const initialAudioResolver = this._initialAudioConsumerResolvers.get(peerId);

          if (initialAudioResolver) {
            initialAudioResolver();
            this._initialAudioConsumerResolvers.delete(peerId);
          }
        }
        //document.getElementById('remote-media-div').appendChild(track.attach());
      };
      participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
          const track = publication.track;
          onTrack(track);
        }
        publication.on("subscribed", track => {
          console.log(`publication subscribed`, track);
        });
        publication.on("unsubscribed", track => {
          console.log(`publication unsubscribed`, track);
        });
      });

      participant.on("trackSubscribed", track => {
        onTrack(track);
      });
      participant.on("trackUnsubscribed", track => {
        unpublishGivenVideoTrack(track);
        this._consumers.delete(track.name);
        console.log(`Participant trackUnsubscribed`, track);
      });
      participant.on("trackPublished", track => {
        console.log(`Participant trackPublished`, track);
      });
      participant.on("trackUnpublished", track => {
        console.log(`Participant trackUnpublished`, track);
      });
    };
    this._twilioroom.participants.forEach(participant => {
      onTwilioParticipant(participant);
    });
    this._twilioroom.on("participantConnected", onTwilioParticipant);

    this._twilioroom.on("participantDisconnected", participant => {
      console.log(`Participant disconnected: ${participant.identity}`);
      let peerId = convertId(participant.identity);
      this._consumers.forEach(consumer => {
        if (consumer.appData.peerId === peerId && "video" === consumer.track.kind) {
          unpublishGivenVideoTrack(consumer);
        }
      });
    });

    const urlWithParams = new URL(this._serverUrl);
    urlWithParams.searchParams.append("roomId", this._roomId);
    urlWithParams.searchParams.append("peerId", this._clientId);

    this.protooHelper = new ProtooHelper();
    await this.protooHelper.init(urlWithParams);
    this._protoo =this.protooHelper._protoo;

    this._closed = false;
    await this._joinRoom();

    this.protooHelper._protoo.on("notification", notification => {
      switch (notification.method) {
        case "newPeer": {
          const peer = notification.data;
          this.newPeer(peer);
          break;
        }

        case "peerClosed": {
          const { peerId } = notification.data;
          this.closePeer(peerId);
          break;
        }

        case "peerBlocked": {
          const { peerId } = notification.data;
          document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: peerId } }));

          break;
        }

        case "peerUnblocked": {
          const { peerId } = notification.data;
          document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: peerId } }));

          break;
        }
      }
    });

    await Promise.all([this.updateTimeOffset(), this._initialAudioConsumerPromise]);
  }

  newPeer(peer) {
    this._onOccupantConnected(peer.id);
    this.occupants[peer.id] = peer;

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }
  }

  closePeer(peerId) {
    this._onOccupantDisconnected(peerId);

    const pendingMediaRequests = this._pendingMediaRequests.get(peerId);

    if (pendingMediaRequests) {
      const msg = "The user disconnected before the media stream was resolved.";
      info(msg);

      if (pendingMediaRequests.audio) {
        pendingMediaRequests.audio.resolve(null);
      }

      if (pendingMediaRequests.video) {
        pendingMediaRequests.video.resolve(null);
      }

      this._pendingMediaRequests.delete(peerId);
    }

    // Resolve initial audio resolver since this person left.
    const initialAudioResolver = this._initialAudioConsumerResolvers.get(peerId);

    if (initialAudioResolver) {
      initialAudioResolver();

      this._initialAudioConsumerResolvers.delete(peerId);
    }

    delete this.occupants[peerId];

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }
  }

  shouldStartConnectionTo() {
    return true;
  }

  startStreamConnection() {
  }

  closeStreamConnection() {
  }

  resolvePendingMediaRequestForTrack(clientId, track) {
    const requests = this._pendingMediaRequests.get(clientId);

    if (requests && requests[track.kind]) {
      const resolve = requests[track.kind].resolve;
      delete requests[track.kind];
      resolve(new MediaStream([track]));
    }

    if (requests && Object.keys(requests).length === 0) {
      this._pendingMediaRequests.delete(clientId);
    }
  }

  removeConsumer(consumerId) {
    this.emitRTCEvent("info", "RTC", () => `Consumer removed: ${consumerId}`);
    this._consumers.delete(consumerId);
  }

  getConnectStatus(/*clientId*/) {
    return this._twilioroom.state === "connected" ? NAF.adapters.IS_CONNECTED : NAF.adapters.NOT_CONNECTED;
  }

  getMediaStream(clientId, kind = "audio") {
    console.log("getMedia stream :"+clientId);
    let track;

    if (this._clientId === clientId) {
      if (kind === "audio" && this._micProducer) {
        track = this._micProducer;
      } else if (kind === "video" && this._videoProducer) {
        track = this._videoProducer;
      }
    } else {
      this._consumers.forEach(consumer => {
        if (consumer.appData.peerId === clientId && kind == consumer.track.kind) {
          track = consumer.track;
        }
      });
    }

    if (track) {
      debug(`Already had ${kind} for ${clientId}`);
      return Promise.resolve(new MediaStream([track]));
    } else {
      debug(`Waiting on ${kind} for ${clientId}`);
      if (!this._pendingMediaRequests.has(clientId)) {
        this._pendingMediaRequests.set(clientId, {});
      }

      const requests = this._pendingMediaRequests.get(clientId);
      const promise = new Promise((resolve, reject) => (requests[kind] = { resolve, reject }));
      requests[kind].promise = promise;
      promise.catch(e => {
        this.emitRTCEvent("error", "Adapter", () => `getMediaStream error: ${e}`);
        console.warn(`${clientId} getMediaStream Error`, e);
      });
      return promise;
    }
  }

  getServerTime() {
    return Date.now() + this._avgTimeOffset;
  }

  sendData(clientId, dataType, data) {
    this.unreliableTransport(clientId, dataType, data);
  }
  sendDataGuaranteed(clientId, dataType, data) {
    this.reliableTransport(clientId, dataType, data);
  }
  broadcastData(dataType, data) {
    this.unreliableTransport(undefined, dataType, data);
  }
  broadcastDataGuaranteed(dataType, data) {
    this.reliableTransport(undefined, dataType, data);
  }

  setReconnectionListeners(reconnectingListener, reconnectedListener, reconnectionErrorListener) {
    this._reconnectingListener = reconnectingListener;
    this._reconnectedListener = reconnectedListener;
    this._reconnectionErrorListener = reconnectionErrorListener;
  }

  syncOccupants() {
    // Not implemented
  }

  async createSendTransport() {

  }

  async closeSendTransport() {
  }

  async createRecvTransport() {

  }

  async closeRecvTransport() {
  }

  async createMissingConsumers() {
  }

  async _joinRoom() {
    debug("_joinRoom()");

    try {
      const { peers } = await this.protooHelper.join(this._clientId,this._device,this._joinToken);
      const audioConsumerPromises = [];
      this.occupants = {};

      // Create a promise that will be resolved once we attach to all the initial consumers.
      // This will gate the connection flow until all voices will be heard.
      for (let i = 0; i < peers.length; i++) {
        const peerId = peers[i].id;
        this._onOccupantConnected(peerId);
        this.occupants[peerId] = peers[i];
        if (!peers[i].hasProducers) continue;
        audioConsumerPromises.push(new Promise(res => this._initialAudioConsumerResolvers.set(peerId, res)));
      }

      this._connectSuccess(this._clientId);
      this._initialAudioConsumerPromise = Promise.all(audioConsumerPromises);

      if (this._onOccupantsChanged) {
        this._onOccupantsChanged(this.occupants);
      }
    } catch (err) {
      this.emitRTCEvent("error", "Adapter", () => `Join room failed: ${error}`);
      error("_joinRoom() failed:%o", err);

      if (!this._reconnectionTimeout) {
        this._reconnectionTimeout = setTimeout(() => this.reconnect(), this._reconnectionDelay);
      }
    }
  }

  setLocalMediaStream(stream) {
    this.createMissingProducers(stream);
  }

  createMissingProducers(stream) {
    this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);

    let sawAudio = false;
    let sawVideo = false;

    stream.getTracks().forEach(async track => {
      if (track.kind === "audio") {
        sawAudio = true;

        // TODO multiple audio tracks?
        if (this._micProducer) {
          if (this._micProducer !== track) {
            this._micProducer.stop();
          }
        } else {
          if (!this._micEnabled) {
            track.enabled = false;
          }

          // stopTracks = false because otherwise the track will end during a temporary disconnect
          this._micProducer = track;
        }
      } else {
        sawVideo = true;

        if (this._videoProducer) {
          if (this._videoProducer !== track) {
            if (this._videoProducer) {
              this._videoProducer.stop();
            }
          }
        } else {
          // stopTracks = false because otherwise the track will end during a temporary disconnect
          this._videoProducer = track;
        }
      }

      this.resolvePendingMediaRequestForTrack(this._clientId, track);
    });

    if (!sawAudio && this._micProducer) {
      this._micProducer.close();
      this._micProducer = null;
    }

    if (!sawVideo && this._videoProducer) {
      unpublishVideoTrack();//this._videoProducer.close();
      this._videoProducer = null;
    }

    this._localMediaStream = stream;
  }

  enableMicrophone(enabled) {
    if(this._twilioroom) {
      if (enabled) {
        this._twilioroom.localParticipant.audioTracks.forEach(publication => {
          publication.track.enable();
        });
      } else {
        this._twilioroom.localParticipant.audioTracks.forEach(publication => {
          publication.track.disable();
        });
      }
    }
    this._micEnabled = enabled;

    window.APP.store.update({
      settings: { micMuted: !this._micEnabled }
    });
  }

  setWebRtcOptions() {
    // Not implemented
  }

  isDisconnected() {
    return this._twilioroom.state !== "connected";
  }

  disconnect() {
    if(this._twilioroom) {
      this._twilioroom.disconnect();
    }
    if (this._closed) return;

    this._closed = true;

    const occupantIds = Object.keys(this.occupants);
    for (let i = 0; i < occupantIds.length; i++) {
      const peerId = occupantIds[i];
      if (peerId === this._clientId) continue;
      this._onOccupantDisconnected(peerId);
    }

    this.occupants = {};

    if (this._onOccupantsChanged) {
      this._onOccupantsChanged(this.occupants);
    }

    debug("disconnect()");

    this.emitRTCEvent("info", "Signaling", () => `[close]`);

    this._lastRecvConnectionState = null;
    this._lastSendConnectionState = null;
  }

  reconnect() {
    // Dispose of all networked entities and other resources tied to the session.
    this.disconnect();

    this.connect()
        .then(() => {
          this._reconnectionDelay = INITIAL_ROOM_RECONNECTION_INTERVAL;
          this._reconnectionAttempts = 0;

          if (this._reconnectedListener) {
            this._reconnectedListener();
          }

          clearInterval(this._reconnectionTimeout);
          this._reconnectionTimeout = null;
        })
        .catch(error => {
          this._reconnectionDelay += 1000;
          this._reconnectionAttempts++;

          if (this._reconnectionAttempts > this.max_reconnectionAttempts && this._reconnectionErrorListener) {
            return this._reconnectionErrorListener(
                new Error("Connection could not be reestablished, exceeded maximum number of reconnection attempts.")
            );
          }

          this.emitRTCEvent("warn", "Adapter", () => `Error during reconnect, retrying: ${error}`);
          console.warn("Error during reconnect, retrying.");
          console.warn(error);

          if (this._reconnectingListener) {
            this._reconnectingListener(this._reconnectionDelay);
          }

          if (!this._reconnectionTimeout) {
          this._reconnectionTimeout = setTimeout(() => this.reconnect(), this._reconnectionDelay);
        }
      });
  }

  kick(clientId, permsToken) {
    return this.protooHelper.kick(clientId, permsToken,this.room)
      .then(() => {
        document.body.dispatchEvent(new CustomEvent("kicked", { detail: { clientId: clientId } }));
      });
  }

  block(clientId) {
    return this.protooHelper.block(clientId).then(() => {
      this._blockedClients.set(clientId, true);
      document.body.dispatchEvent(new CustomEvent("blocked", { detail: { clientId: clientId } }));
    });
  }

  unblock(clientId) {
    return this.protooHelper.unblock(clientId).then(() => {
      this._blockedClients.delete(clientId);
      document.body.dispatchEvent(new CustomEvent("unblocked", { detail: { clientId: clientId } }));
    });
  }

  async updateTimeOffset() {
    if (this.isDisconnected()) return;

    const clientSentTime = Date.now();

    const res = await fetch(document.location.href, {
      method: "HEAD",
      cache: "no-cache"
    });

    const precision = 1000;
    const serverReceivedTime = new Date(res.headers.get("Date")).getTime() + precision / 2;
    const clientReceivedTime = Date.now();
    const serverTime = serverReceivedTime + (clientReceivedTime - clientSentTime) / 2;
    const timeOffset = serverTime - clientReceivedTime;

    this._serverTimeRequests++;

    if (this._serverTimeRequests <= 10) {
      this._timeOffsets.push(timeOffset);
    } else {
      this._timeOffsets[this._serverTimeRequests % 10] = timeOffset;
    }

    this._avgTimeOffset = this._timeOffsets.reduce((acc, offset) => (acc += offset), 0) / this._timeOffsets.length;

    if (this._serverTimeRequests > 10) {
      debug(`new server time offset: ${this._avgTimeOffset}ms`);
      setTimeout(() => this.updateTimeOffset(), 5 * 60 * 1000); // Sync clock every 5 minutes.
    } else {
      this.updateTimeOffset();
    }
  }

  toggleFreeze() {
    if (this.frozen) {
      this.unfreeze();
    } else {
      this.freeze();
    }
  }

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
    this.flushPendingUpdates();
  }

  storeMessage(message) {
    if (message.dataType === "um") {
      // UpdateMulti
      for (let i = 0, l = message.data.d.length; i < l; i++) {
        this.storeSingleMessage(message, i);
      }
    } else {
      this.storeSingleMessage(message);
    }
  }

  storeSingleMessage(message, index) {
    const data = index !== undefined ? message.data.d[index] : message.data;
    const dataType = message.dataType;

    const networkId = data.networkId;

    if (!this._frozenUpdates.has(networkId)) {
      this._frozenUpdates.set(networkId, message);
    } else {
      const storedMessage = this._frozenUpdates.get(networkId);
      const storedData =
          storedMessage.dataType === "um" ? this.dataForUpdateMultiMessage(networkId, storedMessage) : storedMessage.data;

      // Avoid updating components if the entity data received did not come from the current owner.
      const isOutdatedMessage = data.lastOwnerTime < storedData.lastOwnerTime;
      const isContemporaneousMessage = data.lastOwnerTime === storedData.lastOwnerTime;
      if (isOutdatedMessage || (isContemporaneousMessage && storedData.owner > data.owner)) {
        return;
      }

      if (dataType === "r") {
        const createdWhileFrozen = storedData && storedData.isFirstSync;
        if (createdWhileFrozen) {
          // If the entity was created and deleted while frozen, don't bother conveying anything to the consumer.
          this._frozenUpdates.delete(networkId);
        } else {
          // Delete messages override any other messages for this entity
          this._frozenUpdates.set(networkId, message);
        }
      } else {
        // merge in component updates
        if (storedData.components && data.components) {
          Object.assign(storedData.components, data.components);
        }
      }
    }
  }

  onDataChannelMessage(e, source) {
    this.onData(JSON.parse(e.data), source);
  }

  onData(message, source) {
    if (debug.enabled) {
      debug(`DC in: ${message}`);
    }

    if (!message.dataType) return;

    message.source = source;

    if (this.frozen) {
      this.storeMessage(message);
    } else {
      this._onOccupantMessage(null, message.dataType, message.data, message.source);
    }
  }

  getPendingData(networkId, message) {
    if (!message) return null;

    const data = message.dataType === "um" ? this.dataForUpdateMultiMessage(networkId, message) : message.data;

    // Ignore messages from users that we may have blocked while frozen.
    if (data.owner && this._blockedClients.has(data.owner)) return null;

    return data;
  }

  // Used externally
  getPendingDataForNetworkId(networkId) {
    return this.getPendingData(networkId, this._frozenUpdates.get(networkId));
  }

  flushPendingUpdates() {
    for (const [networkId, message] of this._frozenUpdates) {
      const data = this.getPendingData(networkId, message);
      if (!data) continue;

      // Override the data type on "um" messages types, since we extract entity updates from "um" messages into
      // individual frozenUpdates in storeSingleMessage.
      const dataType = message.dataType === "um" ? "u" : message.dataType;

      this._onOccupantMessage(null, dataType, data, message.source);
    }
    this._frozenUpdates.clear();
  }

  dataForUpdateMultiMessage(networkId, message) {
    // "d" is an array of entity datas, where each item in the array represents a unique entity and contains
    // metadata for the entity, and an array of components that have been updated on the entity.
    // This method finds the data corresponding to the given networkId.
    for (let i = 0, l = message.data.d.length; i < l; i++) {
      const data = message.data.d[i];

      if (data.networkId === networkId) {
        return data;
      }
    }

    return null;
  }

  emitRTCEvent(level, tag, msgFunc) {
    if (!window.APP.store.state.preferences.showRtcDebugPanel) return;
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    });
    this.scene.emit("rtc_event", { level, tag, time, msg: msgFunc() });
  }
}

NAF.adapters.register("twilio", NafTwilioAdapter);
