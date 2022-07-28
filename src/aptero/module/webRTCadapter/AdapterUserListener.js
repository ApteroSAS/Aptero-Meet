import EventEmitter from "eventemitter3";

export default class AdapterUserListener {
  em = new EventEmitter();
  onUserEnter(callback) {
    this.em.on("enter", callback);
    return () => {
      this.em.off("enter", callback);
    };
  }

  onUserLeave(callback) {
    this.em.on("leave", callback);
    return () => {
      this.em.off("leave", callback);
    };
  }

  notifyUserEnter(peerid) {
    window.APP.scene.emit("join");
    this.em.emit("enter", peerid);
  }

  notifyUserLeave(peerid) {
    this.em.emit("leave", peerid);
  }

  disconnect() {
    this.em.removeAllListeners();
  }
}
