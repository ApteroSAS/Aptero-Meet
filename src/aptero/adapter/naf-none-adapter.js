import EventEmitter from "eventemitter3";

export default class NoneAdapter extends EventEmitter {
  occupants = {};

  constructor() {
    super();
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

  }

  toggleMicrophone() {

  }

  enableMicrophone(enabled) {

  }

  setLocalMediaStream(stream) {

  }

  disconnect() {

  }
}
