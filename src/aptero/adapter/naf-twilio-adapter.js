import { debug as newDebug } from "debug";
import {
  connectRoom,
  convertId,
  disableCamera,
  disableShare,
  enableMicrophone, isMicEnabled,
  unpublishGivenVideoTrack
} from "./twilio";
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

export const DIALOG_CONNECTION_ERROR_FATAL = "dialog-connection-error-fatal";
export default class NafTwilioAdapter extends EventEmitter {
  constructor() {
    super();
    this._micProducer = null;
    this._cameraProducer = null;
    this._shareProducer = null;
    this._localMediaStream = null;
    this._consumers = new Map();
    this._pendingMediaRequests = new Map();
    this._blockedClients = new Map();
    this._forceTcp = false;
    this._forceTurn = false;
    this._iceTransportPolicy = null;
    this.scene = null;
    this._serverParams = {};
    this._consumerStats = {};
  }
  
  get consumerStats() {
    return this._consumerStats;
  }

    /**
   * Gets transport/consumer/producer stats on the server side.
   */
  async getServerStats() {
    return {};
  }
  async iceRestart(transport) {
  }

  async recreateSendTransport(iceServers) {
  }

  /**
   * Restart ICE in the underlying send peerconnection.
   */
  async restartSendICE() {
  }

  /**
   * Checks the Send Transport ICE status and restarts it in case is in failed state.
   * This is called by the Send Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connnection state (ICE connection state)
   */
  checkSendIceStatus(connectionState) {
  }

  async recreateRecvTransport(iceServers) {
  }

  /**
   * Restart ICE in the underlying receive peerconnection.
   * @param {boolean} force Forces the execution of the reconnect.
   */
  async restartRecvICE() {
  }

  /**
   * Checks the ReeceiveReeceive Transport ICE status and restarts it in case is in failed state.
   * This is called by the Reeceive Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connection state (ICE connection state)
   */
  checkRecvIceStatus(connectionState) {
  }
  


  async connect({
    serverUrl,
    roomId,
    joinToken,
    serverParams,
    scene,
    clientId,
    forceTcp,
    forceTurn,
    iceTransportPolicy
  }) {
    this._serverUrl = serverUrl;
    this._roomId = roomId;
    this._joinToken = joinToken;
    this._serverParams = serverParams;
    this._clientId = clientId;
    this.scene = scene;
    this._forceTcp = forceTcp;
    this._forceTurn = forceTurn;
    this._iceTransportPolicy = iceTransportPolicy;
    
    this._twilioroom = await connectRoom(this._clientId,this._roomId);
    let onTrack = (track,tparticipant)=>{
      //RemoteAudioTrack
      let peerId = convertId(tparticipant.identity);
      console.log(" Add consumer:",track);
      track.appData = {peerId};
      track.track = track.mediaStreamTrack;
      this._consumers.set(track.name, track);
      this.resolvePendingMediaRequestForTrack(peerId, track.track);
    };
    this._twilioroom.onTrack(onTrack);
    const onTwilioParticipant = participant => {
      console.log(`Participant connected: ${participant.identity}`);
      participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
          const track = publication.track;
          onTrack(track,participant);
        }
        publication.on("subscribed", track => {
          console.log(`publication subscribed`, track);
        });
        publication.on("unsubscribed", track => {
          console.log(`publication unsubscribed`, track);
        });
      });

      participant.on("trackSubscribed", track => {
        onTrack(track,participant);
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

    // TODO: Establishing connection could take a very long time.
    //       Inform the user if we are stuck here.
    this.protooHelper = new ProtooHelper();
    await this.protooHelper.init(urlWithParams);
    this._protoo =this.protooHelper._protoo;

    this._closed = false;

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
    return new Promise(async (resolve, reject) => {
      try {
        await this._joinRoom();
        resolve();
      } catch (err) {
        this.emitRTCEvent("warn", "Adapter", () => `Error during connect: ${error}`);
        reject(err);
      }
    });
  }

  async _retryConnectWithNewHost() {
    this.cleanUpLocalState();
    this._protoo.removeAllListeners();
    const serverParams = await APP.hubChannel.getHost();
    const { host, port } = serverParams;
    const newServerUrl = `wss://${host}:${port}`;
    if (this._serverUrl === newServerUrl) {
      console.error("Reconnect to dialog failed.");
      this.emit(DIALOG_CONNECTION_ERROR_FATAL);
      return;
    }
    console.log(`The Dialog server has changed to ${newServerUrl}, reconnecting with the new server...`);
    await this.connect({
      serverUrl: newServerUrl,
      roomId: this._roomId,
      joinToken: APP.hubChannel.token,
      serverParams,
      scene: this.scene,
      clientId: this._clientId,
      forceTcp: this._forceTcp,
      forceTurn: this._forceTurn,
      iceTransportPolicy: this._iceTransportPolicy
    });
  }
  
  closePeer(peerId) {
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

  getMediaStream(clientId, kind = "audio") {
    let track;

    if (this._clientId === clientId) {
      if (kind === "audio" && this._micProducer) {
        track = this._micProducer.track;
      } else if (kind === "video") {
        if (this._cameraProducer && !this._cameraProducer.closed) {
          track = this._cameraProducer.track;
        } else if (this._shareProducer && !this._shareProducer.closed) {
          track = this._shareProducer.track;
        }
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

  async createSendTransport(iceServers) {
    // Create mediasoup Transport for sending (unless we don't want to produce).

  }

  async closeSendTransport() {
  }

  async createRecvTransport(iceServers) {
    // Create mediasoup Transport for sending (unless we don't want to consume).

  }

  async closeRecvTransport() {
  }

  async _joinRoom() {
    debug("_joinRoom()");

      await this.protooHelper.join(this._clientId,this._device,this._joinToken);
    if (this._localMediaStream) {
      // TODO: Refactor to be "Create producers"
      await this.setLocalMediaStream(this._localMediaStream);
    }
  }

  async setLocalMediaStream(stream) {
    this.emitRTCEvent("info", "RTC", () => `Creating missing producers`);
    let sawAudio = false;
    let sawVideo = false;

    await Promise.all(
      stream.getTracks().map(async track => {
      if (track.kind === "audio") {
        sawAudio = true;

        // TODO multiple audio tracks?
        if (this._micProducer) {
            if (this._micProducer.track !== track) {
              this._micProducer.track.stop();
              //this._micProducer.replaceTrack(track);
          }
        } else {
          if (!this._micEnabled) {
            track.enabled = false;
          }

          // stopTracks = false because otherwise the track will end during a temporary disconnect
          this._micProducer = {track};
        }
      } else {
          sawVideo = true;

          if (track._hubs_contentHint === "share") {
            await this.disableCamera();
            await this.enableShare(track);
          } else if (track._hubs_contentHint === "camera") {
            await this.disableShare();
            await this.enableCamera(track);
          }
        }

        this.resolvePendingMediaRequestForTrack(this._clientId, track);
      })
    );

    if (!sawAudio && this._micProducer) {
      this._micProducer.close();
      this._micProducer = null;
    }
    if (!sawVideo) {
      this.disableCamera();
      this.disableShare();
    }
    this._localMediaStream = stream;
  }

  async enableCamera(track) {
    this._cameraProducer = {track};
  }

  async disableCamera() {
    if (!this._cameraProducer) return;
    this._cameraProducer = null;
    return await disableCamera();
  }

  async enableShare(track) {
    this._shareProducer = {track};
  }

  async disableShare() {
    if (!this._shareProducer) return;
    this._shareProducer = null;
    return await disableShare();
  }

  toggleMicrophone() {
    if (this.isMicEnabled) {
      this.enableMicrophone(false);
    } else {
      this.enableMicrophone(true);
    }
  }

  enableMicrophone(enabled) {
    enableMicrophone(enabled);
    this._micShouldBeEnabled = enabled;
    this.emit("mic-state-changed", { enabled: this.isMicEnabled });
  }

  get isMicEnabled() {
    return isMicEnabled();
  }

  cleanUpLocalState() {
    this._micProducer = null;
    this._shareProducer = null;
    this._cameraProducer = null;
  }

  disconnect() {
    if(this._twilioroom) {
      this._twilioroom.disconnect();
    }
    if (this._closed) return;

    debug("disconnect()");
    this.cleanUpLocalState();
    if (this._protoo) {
      this._protoo.removeAllListeners();
      if (this._protoo.connected) {
        this._protoo.close();
        this.emitRTCEvent("info", "Signaling", () => `[close]`);
      }
    }
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
