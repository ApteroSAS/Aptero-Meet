import { customActionRegister } from "../service/api/CustomActionRegister";
import configs from "../../utils/configs";

AFRAME.registerComponent("custom-controller-action-ask", {
  schema: {
    actionIds: { type: "string" },
    triggerId: { type: "string" }
  },

  applyPerm(object3D, data) {
    object3D.visible = false;
    let authorizationData = customActionRegister.triggers[data.triggerId].authorization;
    if (configs.isAdmin()) {
      object3D.visible = true;
    }
    if (authorizationData.permission && window.APP.hubChannel.can(authorizationData.permission)) {
      object3D.visible = true;
    }
    if (authorizationData.emails) {
      let ownerEmail = window.APP.hubChannel.store.state.credentials.email;
      authorizationData.emails.split(",").forEach((email) => {
        if (ownerEmail === email) {
          object3D.visible = true;
        }
      });
    }
  },

  init() {
    this._updateUI = this._updateUI.bind(this);
    this._updateUIOnStateChange = this._updateUIOnStateChange.bind(this);
    this.onHovered = () => {
      this.hovering = true;
      this._updateUI();
    };

    this.onUnhovered = () => {
      this.hovering = false;
      this._updateUI();
    };
    let triggerData = customActionRegister.triggers[this.data.triggerId];
    if (triggerData.authorization) {
      window.APP.hubChannel.addEventListener("permissions_updated", () => {
        this.applyPerm(this.el.object3D, this.data);
      });
      this.applyPerm(this.el.object3D, this.data);
    }

    this.onClick = () => {
      try {
        window.APP.mediaSearchStore.sourceNavigateWithResult("videos2d").then(entry => {
          if (this.data.actionIds) {
            this.data.actionIds.split("+").forEach(id => {
              customActionRegister.triggerAction(id, entry);
            });
          }
        });
      } catch (ex) {
        console.error(ex);
      }
    };
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
    this.el.object3D.addEventListener("hovered", this.onHovered);
    this.el.object3D.addEventListener("unhovered", this.onUnhovered);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
    this.el.object3D.removeEventListener("hovered", this.onHovered);
    this.el.object3D.removeEventListener("unhovered", this.onUnhovered);
  },

  remove() {
    this.el.sceneEl.removeEventListener("stateadded", this._updateUIOnStateChange);
    this.el.sceneEl.removeEventListener("stateremoved", this._updateUIOnStateChange);
  },

  _updateUIOnStateChange(e) {
    if (e.detail !== "frozen") return;
    this._updateUI();
  },

  _updateUI() {
  }
});