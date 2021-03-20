import { mediaLimiter } from "./MediaLimiter";
import { ActionController } from "./ActionController";

export class GLTFExtensionProcessorService {
  constructor(){
    this.actionController = new ActionController();
  }

  async start() {
    await this.actionController.start();
  }

  processGltfFile(gltf, el) {
    let scene = gltf.scene || gltf.scenes[0];
    let sceneuuid = scene.uuid;
    scene.children.forEach(mesh => {
      let meshuuid = mesh.uuid;
      let meshName = mesh.name;
      if (mesh.userData) {
        Object.keys(mesh.userData).forEach((value, masterindex) => {
          let jsonData = mesh.userData[value];
          if (value.startsWith("apt.action.controller")) {
            this.actionController.process(jsonData,el.id,sceneuuid,meshuuid,meshName,masterindex);
          }
          if (value === "apt.limit.pdf") {
            mediaLimiter.setLimit(jsonData);
          }
        });
      }
    });
  }
}

export const gltfExtensionProcessorService = new GLTFExtensionProcessorService();