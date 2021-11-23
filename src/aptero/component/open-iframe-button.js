AFRAME.registerComponent("open-iframe-button", {

  init() {
  },
  play() {
    this.el.object3D.addEventListener("interact", this.click);
  },

  pause() {
    this.el.object3D.qremoveEventListener("interact", this.click);
  },

  click() {
    console.log("render iframe");
    const target = this.el.previousElementSibling.components["open-media-button"].src;
    console.log(target);
    
  }
});