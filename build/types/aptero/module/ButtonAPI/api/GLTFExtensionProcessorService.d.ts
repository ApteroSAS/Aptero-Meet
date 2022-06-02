export class GLTFExtensionProcessorService {
    actionController: ActionController;
    start(): Promise<void>;
    processMeshFile(rootMesh: any, sceneuuid: any): void;
    processGltfFile(children: any, sceneuuid: any): void;
}
export const gltfExtensionProcessorService: GLTFExtensionProcessorService;
import { ActionController } from "./ActionController";
