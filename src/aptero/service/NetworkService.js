import DistributedSoundSystem from "./DistributedSoundSystem";

const EventEmitter = require("eventemitter3");

export class NetworkService {
  eventEmitter = new EventEmitter();

  constructor() {
  }

  start() {
    /* empty start to ensure the import is made*/
  }

  setPhoenixChannel(hubPhxChannel) {
    this.hubPhxChannel = hubPhxChannel;
    this.hubPhxChannel.on("message", ({ session_id, type, body, from }) => {
      this.eventEmitter.emit("msg_recv", { session_id, type, body, from });
      this.eventEmitter.emit(type, { session_id, type, body, from });
    });
  }

  sendMessage(type, data) {
    this.hubPhxChannel.push("message", { type: type, body: data });
  }

  onMessage(type, callback) {
    this.eventEmitter.on(type, callback);
    return () => {
      this.eventEmitter.off(type, callback);
    };
  }


  /**
   * Network utils
   */

  getClientId() {
    return NAF.clientId;
  }

  async getElementNetworkId(element) {
    return new Promise((resolve) => {
      NAF.utils
        .getNetworkedEntity(element)
        .then(networkedEl => {
          resolve(networkedEl.components.networked.data.networkId);
        }).catch(() => {
        resolve(null);
      });
    });
  }

  notifyAdapterReady() {
    this.eventEmitter.emit("adapter_ready");
  }
}

export const networkService = new NetworkService();
