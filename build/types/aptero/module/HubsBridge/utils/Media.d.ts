export function pinEntity(entity: any): Promise<any>;
export function unpinEntity(entity: any): Promise<any>;
export function addMediaAndSetTransform(src: any, position: any, quaternion: any, scale: any, mediaOptions: any, contentOrigin: any, shouldPin: any): HTMLElement;
export function spawnMedia(src: any, contentOrigin: any, data: any): {
    entity: HTMLElement;
    orientation: Promise<any>;
};
export function spawnMediaInfrontOfPlayer(src: any, contentOrigin: any, data: any): HTMLElement;
