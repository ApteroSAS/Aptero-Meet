
export class ThirdPersonService{
  async start(){
    window.APP.store.addEventListener("statechanged", this.storeUpdated);
    this.storeUpdated();
  }

  storeUpdated = () => {
    const thirdPersonMode = window.APP.store.state.preferences["thirdPersonMode"];
    AFRAME.scenes[0].systems["hubs-systems"].cameraSystem.setThirdPersonMode(thirdPersonMode);
  };

  async stop(){
    window.APP.store.removeEventListener("statechanged", this.storeUpdated);
  }
}
