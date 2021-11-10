AFRAME.registerComponent("open-iframe-button", {
  init() {
    this.onclick = async() => {
      console.log("render iframe");
    };
  },
  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  }
});