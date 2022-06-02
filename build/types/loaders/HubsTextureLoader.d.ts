export const TEXTURES_FLIP_Y: boolean;
export default class HubsTextureLoader {
    constructor(manager: any);
    load(url: any, onLoad: any, onProgress: any, onError: any): any;
    loadAsync(url: any, onProgress: any): Promise<any>;
    loadImageBitmapTexture(url: any, onLoad: any, onProgress: any, onError: any): any;
}
