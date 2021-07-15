import EventEmitter from "eventemitter3";

export default class NoneAdapter extends EventEmitter {
  occupants = {};

  constructor() {
    super();
  }
  setApp() {
  }

  setRoom(roomId) {
  }

  setClientId(clientId) {
  }

  setServerConnectListeners(successListener, failureListener) {
  }

  setRoomOccupantListener(occupantListener) {
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
  }

  setServerUrl(url) {
  }

  setJoinToken(joinToken) {
  }

  setTurnConfig(forceTcp, forceTurn) {
  }

  setServerParams(params) {
  }

  setReconnectionListeners(reconnectingListener, reconnectedListener) {
  }

  setWebRtcOptions() {
    // Not implemented
  }

  broadcastDataGuaranteed(dataType, data) {
  }
  broadcastData(dataType, data) {

  }
  async connect() {

  }

  enableMicrophone(enabled) {

  }

  setLocalMediaStream(stream) {

  }

  getServerTime() {
    return Date.now();
  }
}

NAF.adapters.register("none", NoneAdapter);
