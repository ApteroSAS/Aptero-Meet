import {ActionController} from "./ActionController";

export class GLTFExtensionProcessorService {
    private actionController: ActionController;

    constructor() {
        this.actionController = new ActionController();
    }

    processMeshFile(rootMesh, sceneuuid: string) {
        rootMesh.children.forEach(mesh => {
            const meshuuid = mesh.uuid;
            const meshName = mesh.name;
            const el = mesh.el;
            if (mesh.children) {
                this.processMeshFile(mesh, sceneuuid);
            }
            if (mesh.userData) {
                Object.keys(mesh.userData).forEach((value, masterindex) => {
                    let jsonData = mesh.userData[value];
                    if (value.startsWith("apt.action.controller")) {
                        if (!el.id) {
                            el.setAttribute("id", sceneuuid + "_" + meshuuid + "_" + masterindex + "_random_id")//TODO add random id
                        }
    
                        // Add bone attachment processing
                        if (jsonData.triggers && jsonData.triggers[0].customModelProperties?.parentBoneName) {
                            const parentBoneName = jsonData.triggers[0].customModelProperties.parentBoneName;
    
                            // Log or handle the bone attachment info
                            console.log(`Attaching to bone: ${parentBoneName}, Parent: ${meshuuid}`);
                        }
    
                        this.actionController.process(jsonData, el.id, sceneuuid, meshuuid, meshName, masterindex);
                    }
                });
            }
        });
    }

    processGltfFile(root, sceneuuid) {
        this.processMeshFile(root, sceneuuid);
    }
}

export const gltfExtensionProcessorService = new GLTFExtensionProcessorService();
